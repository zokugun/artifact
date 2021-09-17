import { isPlainObject } from 'lodash';
import { Transform } from './transform';

export function stringify(data: any, transform: Transform = {}): string {
	const result = format(data, '', transform);

	return result;
}

function format(data: any, indentValue: string, transform: Transform, separator: boolean = false): string {
	let result: string;

	if(Array.isArray(data)) {
		result = formatArray(data, indentValue, transform);

		if(separator) {
			result += ',';
		}
	}
	else if(isPlainObject(data)) {
		result = formatObject(data, indentValue, transform);

		if(separator) {
			result += ',';
		}
	}
	else {
		result = JSON.stringify(data);

		if(separator) {
			result += ',';
		}

		if(transform.comments?.right) {
			result += transform.comments.right[0];
		}
	}

	return result;
}

function formatArray(data: any[], indentValue: string, transform: Transform): string {
	let result = '[';

	if(transform.comments?.right) {
		result += transform.comments.right[0];
	}

	result += '\n';

	const indent = indentValue + '\t';
	const lastIndex = data.length - 1;
	const children = transform.children ?? {};

	for(const [index, value] of data.entries()) {
		const transform = children[index] ?? {};

		if(transform.emptyLines) {
			result += '\n'.repeat(transform.emptyLines);
		}

		if(transform.comments?.top) {
			for(const line of transform.comments.top) {
				result += `${indent}${line}\n`;
			}
		}

		result += `${indent}`;
		result += format(value, indent, transform, index !== lastIndex || transform.separator);
		result += '\n';

		if(transform.comments?.bottom) {
			for(const line of transform.comments.bottom) {
				result += `${indent}${line}\n`;
			}
		}
	}

	result += `${indentValue}]`;

	return result;
}

function formatObject(data: Record<string, any>, indentValue: string, transform: Transform): string {
	let result = '{';

	if(transform.comments?.right) {
		result += transform.comments.right[0];
	}

	result += '\n';

	const indent = indentValue + '\t';
	const values = Object.entries(data);
	const lastIndex = values.length - 1;
	const children = transform.children ?? {};

	for(const [index, [key, value]] of values.entries()) {
		const transform = children[key] ?? {};

		if(transform.emptyLines) {
			result += '\n'.repeat(transform.emptyLines);
		}

		if(transform.comments?.top) {
			for(const line of transform.comments.top) {
				result += `${indent}${line}\n`;
			}
		}

		result += `${indent}"${key}": `;
		result += format(value, indent, transform, index !== lastIndex || transform.separator);
		result += '\n';

		if(transform.comments?.bottom) {
			for(const line of transform.comments.bottom) {
				result += `${indent}${line}\n`;
			}
		}
	}

	result += `${indentValue}}`;

	return result;
}
