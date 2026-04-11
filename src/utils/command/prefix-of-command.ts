import { splitPrefixAndFlags } from './split-prefix-and-flags.js';

export function prefixOfCommand(command: string): string {
	return splitPrefixAndFlags(command).prefix;
}
