import type { Format } from '../types/format.js';
import { fnmatch } from './fnmatch.js';

export function getFormat(name: string, formats: Format[]): Format | null {
	for(const format of formats) {
		if(fnmatch(name, format.glob)) {
			return format;
		}
	}

	return null;
}
