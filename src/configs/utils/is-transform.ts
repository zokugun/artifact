import { isNonEmptyString, isNonNullable, isNullable, isRecord, isString } from '@zokugun/is-it-type';
import { type FileTransform } from '../../types/config.js';

export function isTransform(value: unknown): value is FileTransform {
	if(!isRecord(value)) {
		return false;
	}

	if(isNonNullable(value.description) && !isString(value.description)) {
		return false;
	}

	if(isNullable(value.jq) || !isNonEmptyString(value.jq)) {
		return false;
	}

	return true;
}
