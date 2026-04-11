import { mergeFlagTokens } from './merge-flag-tokens.js';
import { splitPrefixAndFlags } from './split-prefix-and-flags.js';

export function mergeFlagsAsString(current: string, incoming: { prefix: string; flags: string[] }): string {
	const currentPrefix = splitPrefixAndFlags(current);
	const mergedFlags = mergeFlagTokens(currentPrefix.flags, incoming.flags);

	return currentPrefix.prefix + (mergedFlags.length > 0 ? ' ' + mergedFlags.join(' ') : '');
}
