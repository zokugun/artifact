import { dedupeStrings } from './dedupe-strings';
import { mergeFlagsAsString } from './merge-flags-as-string';
import { mergeSemicolonSegments } from './merge-semicolon-segments';
import { prefixOfCommand } from './prefix-of-command';
import { splitChain } from './split-chain';
import { splitPrefixAndFlags } from './split-prefix-and-flags';
import { splitSegments } from './split-segments';

export function mergeOrSegments(current: string, incoming: string): string {
	const currentSegments = splitSegments(current);
	const incomingSegments = splitSegments(incoming);

	const currentOrIdx = currentSegments.findIndex((s) => s.includes('||'));
	const incomingOrIdx = incomingSegments.findIndex((s) => s.includes('||'));

	if(currentOrIdx === -1 || incomingOrIdx === -1) {
		return mergeSemicolonSegments(current, incoming);
	}

	const currentParts = splitChain(currentSegments[currentOrIdx], '||');
	const incomingParts = splitChain(incomingSegments[incomingOrIdx], '||');
	const currentTail = currentSegments.filter((_, idx) => idx !== currentOrIdx);
	const incomingTail = incomingSegments.filter((_, idx) => idx !== incomingOrIdx);

	const maxLength = Math.max(currentParts.length, incomingParts.length);
	const chainResult: string[] = [];
	const movedToTail: string[] = [];

	for(let i = 0; i < maxLength; i++) {
		const currentPart = currentParts[i];
		const incomingPart = incomingParts[i];

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
			else if(incomingTail.some((t) => t === currentPart || t.startsWith(`${currentPart} `))) {
				chainResult.push(incomingPart);
				movedToTail.push(currentPart);
			}
			else {
				chainResult.push(currentPart);
				const coveredByCurrentTail = currentTail.some((t) => t.startsWith(`${incomingPart} `));
				if(!coveredByCurrentTail) {
					chainResult.push(incomingPart);
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

	const dedupedChain: string[] = [];
	for(const part of chainResult) {
		if(!dedupedChain.includes(part)) {
			dedupedChain.push(part);
		}
	}

	const chainParts = new Set(dedupedChain);
	const rawTail = [...currentTail, ...movedToTail, ...incomingTail];
	const filteredTail = rawTail.filter((tail, idx) => {
		if(chainParts.has(tail)) {
			return false;
		}

		// Keep only the most specific tail when two tails share a prefix.
		return !rawTail.some((other, otherIdx) => otherIdx !== idx && other.startsWith(`${tail} `));
	});

	const mergedChain = dedupedChain.join(' || ');
	const chainPrefixes = new Set(dedupedChain.map(prefixOfCommand).filter(Boolean));
	const mergedSegs = currentSegments
		.map((seg, idx) => (idx === currentOrIdx ? mergedChain : seg))
		.filter((seg, idx) => idx === currentOrIdx || !chainPrefixes.has(prefixOfCommand(seg)));

	for(const tail of dedupeStrings(filteredTail)) {
		if(!mergedSegs.includes(tail)) {
			mergedSegs.push(tail);
		}
	}

	return dedupeStrings(mergedSegs).join('; ');
}
