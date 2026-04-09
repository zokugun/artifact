import { mergeFlagTokens } from './merge-flag-tokens';
import { splitPrefixAndFlags } from './split-prefix-and-flags';

export function mergeFlagsAsString(current: string, incoming: { prefix: string; flags: string[] }): string {
	const currentPrefix = splitPrefixAndFlags(current);
	const mergedFlags = mergeFlagTokens(currentPrefix.flags, incoming.flags);

	return currentPrefix.prefix + (mergedFlags.length > 0 ? ' ' + mergedFlags.join(' ') : '');
}
