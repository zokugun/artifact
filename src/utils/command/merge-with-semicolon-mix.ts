import { mergeFlagsAsString } from './merge-flags-as-string.js';
import { splitChain } from './split-chain.js';
import { splitPrefixAndFlags } from './split-prefix-and-flags.js';

export function mergeWithSemicolonMix(current: string, incoming: string): string | undefined {
	if(!(incoming.includes('&&') && current.includes(';'))) {
		return;
	}

	const allSegments = current.split(/;|&&/).map((s) => s.trim()).filter(Boolean);
	const chainPart = current.split(';')[0] || '';
	const chainCount = chainPart ? splitChain(chainPart, '&&').length : 0;
	const currentChain = allSegments.slice(0, chainCount);
	const tail = allSegments.slice(chainCount);
	const incomingAnd = splitChain(incoming, '&&');

	const chainResult = [...currentChain];
	const appendedTailIdxs: number[] = [];

	for(const incomingSegment of incomingAnd) {
		const incomingParts = splitPrefixAndFlags(incomingSegment);
		let matched = false;
		for(const [i, allSegment] of allSegments.entries()) {
			const currentParts = splitPrefixAndFlags(allSegment);
			if(currentParts.prefix && incomingParts.prefix && currentParts.prefix === incomingParts.prefix) {
				if(i < chainCount) {
					// merge into existing chain position
					const index = i;
					chainResult[index] = mergeFlagsAsString(chainResult[index], incomingParts);
				}
				else {
					// append matching tail segment into chain if not already appended
					if(!appendedTailIdxs.includes(i)) {
						chainResult.push(mergeFlagsAsString(allSegment, incomingParts));
						appendedTailIdxs.push(i);
					}
				}

				matched = true;
				break;
			}
		}

		if(!matched) {
			chainResult.push(incomingSegment);
		}
	}

	// Build remaining tail excluding appended indices
	const remainingTail = tail.filter((_, index) => !appendedTailIdxs.includes(chainCount + index));
	return chainResult.join(' && ') + (remainingTail.length > 0 ? '; ' + remainingTail.join('; ') : '');
}
