import { type DResult } from '@zokugun/xtry';
import type { Request } from '../types/config.js';

export function * toIterator<T>(fn: (arg: T) => DResult<Request>, args: T[]): Generator<DResult<Request>> {
	for(const arg of args) {
		yield fn(arg);
	}
}
