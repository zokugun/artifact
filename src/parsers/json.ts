import { err, ok, stringifyError, xtry } from '@zokugun/xtry/sync';
import { type ParseResult } from '../types/context.js';
import { type Transform } from './jsonc/transform.js';

export function parse(data: string): ParseResult {
	const result = xtry(() => JSON.parse(data) as Record<string, unknown>);

	if(result.fails) {
		return err(stringifyError(result.error));
	}

	return ok({ data: result.value });
}

export function stringify(data: unknown, _transform?: Transform): string {
	return JSON.stringify(data, null, '\t');
}
