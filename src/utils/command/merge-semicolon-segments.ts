import { mergeFlagTokens } from './merge-flag-tokens';
import { mergeFlagsAsString } from './merge-flags-as-string';
import { mergePartsByPrefix } from './merge-parts-by-prefix';
import { prefixOfCommand } from './prefix-of-command';
import { splitChain } from './split-chain';
import { splitPrefixAndFlags } from './split-prefix-and-flags';
import { splitSegments } from './split-segments';

export function mergeSemicolonSegments(current: string, incoming: string): string {
	let currentSegments = splitSegments(current);
	const incomingSegments = splitSegments(incoming);

	for(const incomingSegment of incomingSegments) {
		// If the incoming segment is itself a chain (&& or ||), merge subparts accordingly
		if(incomingSegment.includes('||')) {
			const incomingParts = incomingSegment.split('||').map((s) => s.trim()).filter(Boolean);
			let mergedIntoCurrent = false;
			for(let j = 0; j < currentSegments.length; j++) {
				if(currentSegments[j].includes('||')) {
					const currentParts = splitChain(currentSegments[j], '||');
					const newParts = mergePartsByPrefix(currentParts, incomingParts);
					currentSegments[j] = newParts.join(' || ');
					// remove duplicates that were absorbed
					currentSegments = currentSegments.filter((s, idx) => {
						if(idx === j) {
							return true;
						}

						for(const np of newParts) {
							if(s === np) {
								return false;
							}
						}

						return true;
					});
					mergedIntoCurrent = true;
					break;
				}
			}

			if(!mergedIntoCurrent) {
				currentSegments.push(incomingSegment);
			}

			continue;
		}

		if(incomingSegment.includes('&&')) {
			const incomingParts = splitChain(incomingSegment, '&&');
			let mergedIntoCurrent = false;
			for(let j = 0; j < currentSegments.length; j++) {
				if(currentSegments[j].includes('&&')) {
					const currentParts = splitChain(currentSegments[j], '&&');
					// If first prefixes align, do positional merge preferring incoming flags first
					let newParts: string[] = [];
					if(currentParts.length > 0 && incomingParts.length > 0 && prefixOfCommand(currentParts[0]) === prefixOfCommand(incomingParts[0])) {
						const maxLength = Math.max(currentParts.length, incomingParts.length);
						for(let i = 0; i < maxLength; i++) {
							const curPart = currentParts[i];
							const incPart = incomingParts[i];
							if(curPart && incPart) {
								const curP = splitPrefixAndFlags(curPart);
								const incP = splitPrefixAndFlags(incPart);
								if(curP.prefix && incP.prefix && curP.prefix === incP.prefix) {
									// keep current flags first, then append incoming flags if missing
									const mergedFlags = mergeFlagTokens(curP.flags, incP.flags);

									newParts.push(curP.prefix + (mergedFlags.length > 0 ? ' ' + mergedFlags.join(' ') : ''));
									continue;
								}
							}

							if(curPart) {
								newParts.push(curPart);
							}

							if(!curPart && incPart) {
								newParts.push(incPart);
							}
						}

						currentSegments[j] = newParts.join(' && ');
					}
					else {
						newParts = mergePartsByPrefix(currentParts, incomingParts);
						currentSegments[j] = newParts.join(' && ');
					}

					// remove duplicates that were absorbed — compare by prefix to avoid formatting mismatches
					const newPrefixes = new Set(newParts.map(prefixOfCommand).filter(Boolean));
					currentSegments = currentSegments.filter((s, idx) => {
						if(idx === j) {
							return true;
						}

						const sp = prefixOfCommand(s);
						if(sp && newPrefixes.has(sp)) {
							return false;
						}

						return true;
					});
					mergedIntoCurrent = true;
					break;
				}
			}

			if(!mergedIntoCurrent) {
				currentSegments.push(incomingSegment);
			}

			continue;
		}

		const incomingPartsObject = splitPrefixAndFlags(incomingSegment);
		let matched = false;
		for(let i = 0; i < currentSegments.length; i++) {
			const currentPartsObject = splitPrefixAndFlags(currentSegments[i]);
			if(currentPartsObject.prefix && incomingPartsObject.prefix && currentPartsObject.prefix === incomingPartsObject.prefix) {
				currentSegments[i] = mergeFlagsAsString(currentSegments[i], incomingPartsObject);
				matched = true;
				break;
			}
		}

		if(!matched) {
			currentSegments.push(incomingSegment);
		}
	}

	// Deduplicate top-level semicolon segments by prefix, preserving first occurrence
	const seen: string[] = [];
	const deduped: string[] = [];
	for(const s of currentSegments) {
		const p = prefixOfCommand(s) || s;
		if(!seen.includes(p)) {
			seen.push(p);
			deduped.push(s);
		}
	}

	return deduped.join('; ');
}
