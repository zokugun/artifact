import { mergeFlagTokens } from './merge-flag-tokens.js';
import { splitPrefixAndFlags } from './split-prefix-and-flags.js';

export function mergePartsByPrefix(currentParts: string[], incomingParts: string[]): string[] {
	const result = [...currentParts];
	// Track the index of the last position where we merged or inserted an incoming part
	let lastIndex: number | null = null;

	for(const incomingPart of incomingParts) {
		const incomingPrefix = splitPrefixAndFlags(incomingPart);
		let merged = false;

		for(let k = 0; k < result.length; k++) {
			const currentPrefix = splitPrefixAndFlags(result[k]);
			if(currentPrefix.prefix && incomingPrefix.prefix && currentPrefix.prefix === incomingPrefix.prefix) {
				const mergedFlags = mergeFlagTokens(currentPrefix.flags, incomingPrefix.flags);

				result[k] = currentPrefix.prefix + (mergedFlags.length > 0 ? ' ' + mergedFlags.join(' ') : '');
				merged = true;
				lastIndex = k;
				break;
			}
		}

		if(!merged) {
			// If we previously merged or inserted, place the new incoming part immediately after that position
			if(lastIndex === null) {
				result.push(incomingPart);
				lastIndex = result.length - 1;
			}
			else {
				result.splice(lastIndex + 1, 0, incomingPart);
				lastIndex += 1;
			}
		}
	}

	return result;
}
