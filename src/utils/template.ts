import path from 'path';
import fse from '@zokugun/fs-extra-plus/sync';
import { isNonEmptyString, isPrimitive, type Primitive } from '@zokugun/is-it-type';
import { type DResult, err, ok } from '@zokugun/xtry';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import gitUrlParse from 'git-url-parse';
import { isNil, isPlainObject } from 'lodash-es';
import * as YAML from '../parsers/yaml.js';
import { tryJSON } from './try-json.js';

dayjs.extend(utc);

const EXPRESSION_REGEX = /#\[\[(.*?)]]/g;
const PATH_PROPERTY_REGEX = /^(\w+?)(?:\.|$)(.*)$/;
const PIPE_SEPARATOR_REGEX = /\s*\|>\s*/;
// Pattern: |> fn(_).prop
const PIPE_CALL_REGEX = /^([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)\(\s*_\s*\)\s*(\.\s*.*?)\s*$/;
// Pattern: |> fn
const PIPE_FUNCTION_REGEX = /^([A-Za-z_$][\w$]+(?:\.[A-Za-z_$][\w$]*)*)\s*$/;
// Pattern: |> _.prop
const PIPE_PROPERTY_REGEX = /^_\.\s*(.*?)\s*$/;
const PLACEHOLDER_REGEX = /^((?:[^/.]+(?:[^/]+\/)*\/)?\.?[^.]+(?:\.(?:json|ya?ml))?)\.(.*)$/;

export class TemplateEngine {
	private readonly basePath: string;
	private readonly fileCache = new Map<string, Record<string, any>>();
	private readonly variables: Record<string, Primitive>;
	private readonly variableCache = new Map<string, string>();

	constructor(basePath: string, variables?: Record<string, Primitive>) { // {{{
		this.basePath = basePath;
		this.variables = variables ?? {};
	} // }}}

	public render(template: string): DResult<string> { // {{{
		let content = '';
		let lastIndex = 0;
		let match: RegExpExecArray | null;

		while((match = EXPRESSION_REGEX.exec(template))) {
			const result = this.resolveExpression(match[1]);
			if(result.fails) {
				return result;
			}

			content += template.slice(lastIndex, match.index) + result.value;

			lastIndex = EXPRESSION_REGEX.lastIndex;
		}

		content += template.slice(lastIndex);

		return ok(content);
	} // }}}

	private getValueByPath(values: Record<string, unknown>, propertyPath: string): DResult<{ value: unknown; expression?: string }> { // {{{
		let currentPath = propertyPath;
		let currentValue: unknown = values;

		let match: RegExpExecArray | null;

		while((match = PATH_PROPERTY_REGEX.exec(currentPath))) {
			if(!isPlainObject(currentValue)) {
				return err(`Property path not found: ${propertyPath}`);
			}

			currentValue = (currentValue as Record<string, unknown>)[match[1]];

			if(isNil(currentValue)) {
				return err(`Property not found: ${propertyPath}`);
			}

			currentPath = match[2];

			if(currentPath.length === 0) {
				return ok({ value: currentValue });
			}
		}

		return ok({ value: currentValue, expression: `.${currentPath}` });
	} // }}}

	private evaluateExpression(expression: string, values: Record<string, unknown>): DResult<unknown> { // {{{
		const operands = expression.split(PIPE_SEPARATOR_REGEX);
		const root = this.getValueByPath(values, operands.shift()!);
		if(root.fails) {
			return root;
		}

		const { value, expression: rootExpression } = root.value;

		if(operands.length === 0) {
			if(isNonEmptyString<string>(rootExpression)) {
				// eslint-disable-next-line no-new-func
				const fn = new Function('it', `return it${unescapeCode(rootExpression)};`);

				return ok(fn(value));
			}
			else {
				return ok(value);
			}
		}

		const lines: string[] = [];

		if(isNonEmptyString<string>(rootExpression)) {
			lines.push(`it = it${unescapeCode(rootExpression)};`);
		}

		let match: RegExpExecArray | null = null;

		for(const operand of operands) {
			if((match = PIPE_FUNCTION_REGEX.exec(operand))) {
				lines.push(`it = ${unescapeCode(match[1])}(it);`);
			}
			else if((match = PIPE_PROPERTY_REGEX.exec(operand))) {
				lines.push(`it = it.${unescapeCode(match[1])};`);
			}
			else if((match = PIPE_CALL_REGEX.exec(operand))) {
				lines.push(`it = ${unescapeCode(match[1])}(it)${unescapeCode(match[2])};`);
			}
			else {
				return err(`Cannot evaluate "${expression}"`);
			}
		}

		lines.push('return it;');

		// eslint-disable-next-line no-new-func
		const fn = new Function('it, toGitUrl', lines.join('\n'));

		return ok(fn(value, gitUrlParse));
	} // }}}

	private parseFile(filename: string): DResult<Record<string, any>> { // {{{
		const result = fse.readFile(filename, 'utf8');
		if(result.fails) {
			return err(`TemplateError: File not found: ${filename}`);
		}

		const content = result.value;
		const extension = path.extname(filename).toLowerCase();

		try {
			if(extension === '.json') {
				return ok(JSON.parse(content) as Record<string, any>);
			}
			else if(extension === '.yaml' || extension === '.yml') {
				return ok(YAML.parse(content));
			}
			else {
				return ok(tryJSON(content) ?? YAML.parse(content));
			}
		}
		catch (parseError: unknown) {
			return err(`Failed to parse ${filename}: ${(parseError as Error).message}`);
		}
	} // }}}

	private readConfigFile(filename: string): DResult<Record<string, any>> { // {{{
		// Check cache first
		if(this.fileCache.has(filename)) {
			return ok(this.fileCache.get(filename)!);
		}

		const filePath = path.resolve(this.basePath, filename);

		const result = this.parseFile(filePath);
		if(result.fails) {
			return result;
		}

		this.fileCache.set(filename, result.value);

		return result;
	} // }}}

	private resolveExpression(expression: string): DResult<string> { // {{{
		const result = this.splitPlaceholder(expression);
		if(result.fails) {
			return result;
		}

		const { name, propertyPath } = result.value;

		if(!name || !propertyPath) {
			return err(`Invalid expression format: ${expression}. Expected format: #[[filename.property]]`);
		}

		if(name === 'date') {
			return this.toDate(propertyPath);
		}
		else if(name === 'vars') {
			return this.resolveVariable(propertyPath);
		}
		else {
			const readResult = this.readConfigFile(name);
			if(readResult.fails) {
				return readResult;
			}

			// const getValueResult = this.getValueByPath(readResult.value, propertyPath);
			const evalResult = this.evaluateExpression(propertyPath, readResult.value);
			if(evalResult.fails) {
				return evalResult;
			}

			if(isNil(evalResult.value)) {
				return err(expression);
			}

			return ok(String(evalResult.value));
		}
	} // }}}

	private resolveVariable(name: string): DResult<string> { // {{{
		if(this.variableCache.has(name)) {
			return ok(this.variableCache.get(name)!);
		}

		const value = this.variables[name];
		if(!isPrimitive(value)) {
			return err(`Invalid variable: ${name}.`);
		}

		const expression = String(value).trim();
		if(expression.length === 0) {
			return err(`Invalid variable: ${name}.`);
		}

		if(expression.at(0) === '=') {
			const result = this.resolveExpression(expression.slice(1));
			if(result.fails) {
				return result;
			}

			this.variableCache.set(name, result.value);

			return result;
		}
		else {
			const value = expression.at(0) === '\\' && expression.at(1) === '=' ? expression.slice(1) : expression;

			this.variableCache.set(name, value);

			return ok(value);
		}
	} // }}}

	private splitPlaceholder(placeholder: string): DResult<{ name: string; propertyPath: string }> { // {{{
		const matches = PLACEHOLDER_REGEX.exec(placeholder);
		if(!matches) {
			return err(`Invalid expression format: ${placeholder}. Expected format: #[[filename.property]]`);
		}

		const [, name, propertyPath] = matches;

		return ok({ name, propertyPath });
	} // }}}

	private toDate(format: string): DResult<string> { // {{{
		try {
			const now = dayjs().utc();

			if(format === 'utc') {
				return ok(now.format('YYYY-MM-DD HH:mm:ss'));
			}

			return ok(now.format(format));
		}
		catch {
			return err(`Invalid date format: ${format}`);
		}
	} // }}}
}

function unescapeCode(code: string): string {
	return code.replaceAll(/\\('|\\)/g, '$1').replaceAll(/[\r\t\n]/g, ' ');
}
