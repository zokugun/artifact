import path from 'path';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import fse from 'fs-extra';
import * as YAML from '../parsers/yaml';
import { tryJson } from './try-json';

dayjs.extend(utc);

const PLACEHOLDER_REGEX = /^((?:[^/]+(?:[^/]+\/)*\/)?\.?[^.]+(?:\.(?:json|ya?ml))?)\.(.*)$/;

class TemplateError extends Error {
	constructor(message: string) { // {{{
		super(message);
		this.name = 'TemplateError';
	} // }}}
}

export class TemplateEngine {
	private readonly fileCache = new Map<string, Record<string, any>>();
	private readonly basePath: string;

	constructor(basePath: string) { // {{{
		this.basePath = basePath;
	} // }}}

	public render(template: string): string { // {{{
		const pattern = /#\[\[(.*?)]]/g;

		return template.replace(pattern, (_, placeholder: string) => {
			const [name, propertyPath] = this.splitPlaceholder(placeholder);

			if(!name || !propertyPath) {
				throw new TemplateError(`Invalid placeholder format: ${placeholder}. Expected format: #[[filename.property]]`);
			}

			if(name === 'date') {
				return this.toDate(propertyPath);
			}

			const fileContent = this.readConfigFile(name);
			const value: unknown = this.getValueByPath(fileContent, propertyPath);

			if(value === null || value === undefined) {
				throw new TemplateError(placeholder);
			}

			return String(value);
		});
	} // }}}

	private getValueByPath(values: Record<string, any>, propertyPath: string): any { // {{{
		const parts = propertyPath.split('.');
		let current: unknown = values;

		for(const part of parts) {
			if(current === null || current === undefined || typeof current !== 'object') {
				throw new TemplateError(`Property path not found: ${propertyPath}`);
			}

			current = current[part];
		}

		if(current === null || current === undefined) {
			throw new TemplateError(`Property not found: ${propertyPath}`);
		}

		return current;
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

	private splitPlaceholder(placeholder: string): [string, string] { // {{{
		const matches = PLACEHOLDER_REGEX.exec(placeholder);
		if(!matches) {
			throw new TemplateError(`Invalid placeholder format: ${placeholder}. Expected format: #[[filename.property]]`);
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
