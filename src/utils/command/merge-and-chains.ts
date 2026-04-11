import { dedupeStrings } from './dedupe-strings.js';
import { mergeFlagsAsString } from './merge-flags-as-string.js';
import { mergePartsByPrefix } from './merge-parts-by-prefix.js';
import { prefixOfCommand } from './prefix-of-command.js';
import { splitChain } from './split-chain.js';
import { splitPrefixAndFlags } from './split-prefix-and-flags.js';
import { splitSegments } from './split-segments.js';

export function mergeAndChains(current: string, incoming: string): string | undefined {
	if(!(incoming.includes('&&') && current.includes('&&'))) {
		return;
	}

	const currentMain = (current.split(';')[0] || '').trim();
	const incomingMain = (incoming.split(';')[0] || '').trim();
	const currentAnd = splitChain(currentMain, '&&');
	const incomingAnd = splitChain(incomingMain, '&&');

	// Consider positional match primarily by the first segment's prefix
	const firstCurrent = currentAnd[0] || '';
	const firstIncoming = incomingAnd[0] || '';
	const positionalMatch = prefixOfCommand(firstCurrent) === prefixOfCommand(firstIncoming);

	if(!positionalMatch) {
		// Merge by matching prefixes across current segments, append unmatched incoming segments.
		const merged = mergePartsByPrefix(currentAnd, incomingAnd);
		return merged.join('; ');
	}

	// Positional merge: iterate positions, merge flags when prefixes equal, otherwise
	// decide ordering: if incoming's semicolon tail contains current segment, prefer incoming in chain and move current to tail;
	// else keep current in chain then append incoming segment after it.
	const incomingTail = splitSegments(incoming).slice(1);
	const currentTail = splitSegments(current).slice(1);

	const maxLength = Math.max(currentAnd.length, incomingAnd.length);
	const chainResult: string[] = [];
	const tailResult: string[] = [];

	for(let i = 0; i < maxLength; i++) {
		const currentPart = currentAnd[i];
		const incomingPart = incomingAnd[i];
		if(currentPart && incomingPart) {
			const cPref = prefixOfCommand(currentPart);
			const nPref = prefixOfCommand(incomingPart);
			if(cPref && nPref && cPref === nPref) {
				if(incomingTail.length > 0) {
					chainResult.push(mergeFlagsAsString(incomingPart, splitPrefixAndFlags(currentPart)));
				}
				else {
					chainResult.push(mergeFlagsAsString(currentPart, splitPrefixAndFlags(incomingPart)));
				}
			}
			else {
				// prefixes differ
				if(incomingTail.some((t) => t === currentPart || t.startsWith(`${currentPart} `))) {
					// incoming already includes current as a semicolon tail -> prefer incoming in chain
					chainResult.push(incomingPart);
					tailResult.push(currentPart);
				}
				else {
					const currentAppearsLaterInIncoming = incomingAnd
						.slice(i + 1)
						.some((later) => prefixOfCommand(later) === cPref);

					if(currentAppearsLaterInIncoming) {
						// Incoming inserted a step before current and shifted current to the right.
						chainResult.push(incomingPart, currentPart);
					}
					else {
						// keep current in chain, then include incoming after
						chainResult.push(currentPart);
						const coveredByCurrentTail = currentTail.some((t) => t.startsWith(`${incomingPart} `));
						if(!coveredByCurrentTail) {
							chainResult.push(incomingPart);
						}
					}
				}
			}
		}
		else if(currentPart) {
			chainResult.push(currentPart);
		}
		else if(incomingPart) {
			chainResult.push(incomingPart);
		}
	}

	const dedupedChain = dedupeStrings(chainResult);

	// Append any remaining semicolon tails from current and incoming (preserve incoming tail order)
	// remove any tail entries that are already present in the chainResult (by prefix)
	const chainPrefixes = new Set(dedupedChain.map(prefixOfCommand).filter(Boolean));
	const combined = [...tailResult, ...currentTail, ...incomingTail].filter((t) => {
		const tp = prefixOfCommand(t) || t;
		return !chainPrefixes.has(tp);
	});
	const seen = new Set<string>();
	const remainingTail: string[] = [];
	for(const t of combined) {
		if(!seen.has(t)) {
			seen.add(t);
			remainingTail.push(t);
		}
	}

	return dedupedChain.join(' && ') + (remainingTail.length > 0 ? '; ' + remainingTail.join('; ') : '');
}
