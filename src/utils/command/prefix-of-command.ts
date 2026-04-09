import { splitPrefixAndFlags } from './split-prefix-and-flags';

export function prefixOfCommand(command: string): string {
	return splitPrefixAndFlags(command).prefix;
}
