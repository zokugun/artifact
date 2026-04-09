import { mergeFlagTokens } from './merge-flag-tokens';
import { splitPrefixAndFlags } from './split-prefix-and-flags';

export function mergePartsByPrefix(currentParts: string[], incomingParts: string[]): string[] {
	const result = currentParts.slice();
	for(const incomingPart of incomingParts) {
		const incomingPrefix = splitPrefixAndFlags(incomingPart);
		let merged = false;
		for(let k = 0; k < result.length; k++) {
			const currentPrefix = splitPrefixAndFlags(result[k]);
			if(currentPrefix.prefix && incomingPrefix.prefix && currentPrefix.prefix === incomingPrefix.prefix) {
				const mergedFlags = mergeFlagTokens(currentPrefix.flags, incomingPrefix.flags);

				result[k] = currentPrefix.prefix + (mergedFlags.length > 0 ? ' ' + mergedFlags.join(' ') : '');
				merged = true;
				break;
			}
		}

		if(!merged) {
			result.push(incomingPart);
		}
	}

	return result;
}
