import path from 'path';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import fse from 'fs-extra';
import { isNil, isPlainObject } from 'lodash';
import * as YAML from '../parsers/yaml';
import { tryJson } from './try-json';

dayjs.extend(utc);

const NEXT_PROPERTY_REGEX = /^(\w+?)((?=\.|$).*)$/;
const PLACEHOLDER_REGEX = /^((?:[^/.]+(?:[^/]+\/)*\/)?\.?[^.]+(?:\.(?:json|ya?ml))?)\.(.*)$/;

class TemplateError extends Error {
	constructor(message: string) { // {{{
		super(message);
		this.name = 'TemplateError';
	} // }}}
}

export class TemplateEngine {
	private readonly basePath: string;
	private readonly fileCache = new Map<string, Record<string, any>>();
	private readonly variables: Record<string, string>;
	private readonly variableCache = new Map<string, string>();

	constructor(basePath: string, variables?: Record<string, string>) { // {{{
		this.basePath = basePath;
		this.variables = variables ?? {};
	} // }}}

	public render(template: string): string { // {{{
		const pattern = /#\[\[(.*?)]]/g;

		return template.replace(pattern, (_, placeholder: string) => this.resolveExpression(placeholder));
	} // }}}

	private getValueByPath(values: Record<string, any>, propertyPath: string): any { // {{{
		let currentPath = propertyPath;
		let currentValue: unknown = values;
		// eslint-disable-next-line @typescript-eslint/ban-types
		let match: RegExpExecArray | null;

		while((match = NEXT_PROPERTY_REGEX.exec(currentPath))) {
			if(!isPlainObject(currentValue)) {
				throw new TemplateError(`Property path not found: ${propertyPath}`);
			}

			currentValue = (currentValue as Record<string, unknown>)[match[1]];

			if(isNil(currentValue)) {
				throw new TemplateError(`Property not found: ${propertyPath}`);
			}

			currentPath = match[2];

			if(currentPath.length === 0) {
				return currentValue;
			}
		}

		// eslint-disable-next-line no-new-func
		const fn = new Function('it', `return it${unescapeCode(currentPath)};`);

		return fn(currentValue);
	} // }}}

	private parseFile(filename: string): Record<string, any> { // {{{
		let content;

		try {
			content = fse.readFileSync(filename, 'utf8');
		}
		catch {
			throw new TemplateError(`File not found: ${filename}`);
		}

		const ext = path.extname(filename).toLowerCase();

		try {
			if(ext === '.json') {
				return JSON.parse(content) as Record<string, any>;
			}
			else if(ext === '.yaml' || ext === '.yml') {
				return YAML.parse(content);
			}
			else {
				return tryJson(content) ?? YAML.parse(content);
			}
		}
		catch (parseError: unknown) {
			throw new TemplateError(`Failed to parse ${filename}: ${(parseError as Error).message}`);
		}
	} // }}}

	private readConfigFile(filename: string): Record<string, any> { // {{{
		// Check cache first
		if(this.fileCache.has(filename)) {
			return this.fileCache.get(filename)!;
		}

		const filePath = path.resolve(this.basePath, filename);
		const content = this.parseFile(filePath);

		this.fileCache.set(filename, content);

		return content;
	} // }}}

	private resolveExpression(expression: string): string { // {{{
		const [name, propertyPath] = this.splitPlaceholder(expression);

		if(!name || !propertyPath) {
			throw new TemplateError(`Invalid expression format: ${expression}. Expected format: #[[filename.property]]`);
		}

		if(name === 'date') {
			return this.toDate(propertyPath);
		}
		else if(name === 'vars') {
			return this.resolveVariable(propertyPath);
		}
		else {
			const fileContent = this.readConfigFile(name);
			const value: unknown = this.getValueByPath(fileContent, propertyPath);

			if(isNil(value)) {
				throw new TemplateError(expression);
			}

			return String(value);
		}
	} // }}}

	private resolveVariable(name: string): string { // {{{
		if(this.variableCache.has(name)) {
			return this.variableCache.get(name)!;
		}

		const expression = this.variables[name];
		if(typeof expression !== 'string' || expression.trim().length === 0) {
			throw new TemplateError(`Invalid variable: ${name}.`);
		}

		const content = this.resolveExpression(expression);

		this.variableCache.set(name, content);

		return content;
	} // }}}

	private splitPlaceholder(placeholder: string): [string, string] { // {{{
		const matches = PLACEHOLDER_REGEX.exec(placeholder);
		if(!matches) {
			throw new TemplateError(`Invalid expression format: ${placeholder}. Expected format: #[[filename.property]]`);
		}

		const [, filename, propertyPath] = matches;

		return [filename, propertyPath];
	} // }}}

	private toDate(format: string): string { // {{{
		try {
			const now = dayjs().utc();

			if(format === 'utc') {
				return now.format('YYYY-MM-DD HH:mm:ss');
			}

			return now.format(format);
		}
		catch {
			throw new TemplateError(`Invalid date format: ${format}`);
		}
	} // }}}
}

export function unescapeCode(code: string): string {
	return code.replace(/\\('|\\)/g, '$1').replace(/[\r\t\n]/g, ' ');
}
