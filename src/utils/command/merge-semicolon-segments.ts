import { mergeFlagTokens } from './merge-flag-tokens.js';
import { mergeFlagsAsString } from './merge-flags-as-string.js';
import { mergePartsByPrefix } from './merge-parts-by-prefix.js';
import { prefixOfCommand } from './prefix-of-command.js';
import { splitChain } from './split-chain.js';
import { splitPrefixAndFlags } from './split-prefix-and-flags.js';
import { splitSegments } from './split-segments.js';

export function mergeSemicolonSegments(current: string, incoming: string): string {
	let currentSegments = splitSegments(current);
	const incomingSegments = splitSegments(incoming);

	// Pre-scan incoming segments to find which ones match existing current segments by prefix
	const initialMatchedIndices: number[] = incomingSegments.map((seg) => {
		const p = splitPrefixAndFlags(seg).prefix;
		return currentSegments.findIndex((cs) => splitPrefixAndFlags(cs).prefix === p);
	});

	for(let incomingIndex = 0; incomingIndex < incomingSegments.length; incomingIndex++) {
		const incomingSegment = incomingSegments[incomingIndex];
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
					currentSegments = currentSegments.filter((s, index) => {
						if(index === j) {
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
				// Determine insertion position based on matched incoming segments context
				let previousMatch = -1;
				for(let j = incomingIndex - 1; j >= 0; j--) {
					const mi = initialMatchedIndices[j];
					if(mi >= 0) {
						const pref = splitPrefixAndFlags(incomingSegments[j]).prefix;
						const pos = currentSegments.findIndex((cs) => splitPrefixAndFlags(cs).prefix === pref);
						if(pos !== -1) {
							previousMatch = pos;
							break;
						}
					}
				}

				let nextMatch = -1;
				for(let j = incomingIndex + 1; j < incomingSegments.length; j++) {
					const mi = initialMatchedIndices[j];
					if(mi >= 0) {
						const pref = splitPrefixAndFlags(incomingSegments[j]).prefix;
						const pos = currentSegments.findIndex((cs) => splitPrefixAndFlags(cs).prefix === pref);
						if(pos !== -1) {
							nextMatch = pos;
							break;
						}
					}
				}

				const incomingBase = (splitPrefixAndFlags(incomingSegment).prefix || incomingSegment).split(' ')[0];
				let basePos: number | null = null;
				for(let k = currentSegments.length - 1; k >= 0; k--) {
					const cp = splitPrefixAndFlags(currentSegments[k]).prefix || currentSegments[k];
					const cpBase = cp.split(' ')[0];
					if(cpBase === incomingBase) {
						basePos = k;
						break;
					}
				}

				let insertPos: number;
				if((previousMatch >= 0) && (nextMatch >= 0)) {
					insertPos = previousMatch + 1;
				}
				else if((basePos !== null) && (nextMatch < 0)) {
					insertPos = basePos + 1;
				}
				else if(previousMatch >= 0) {
					insertPos = previousMatch + 1;
				}
				else if(nextMatch >= 0) {
					insertPos = nextMatch + 1;
				}
				else {
					insertPos = currentSegments.length;
				}

				currentSegments.splice(insertPos, 0, incomingSegment);
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
							const currentPart = currentParts[i];
							const incPart = incomingParts[i];
							if(currentPart && incPart) {
								const currentP = splitPrefixAndFlags(currentPart);
								const incP = splitPrefixAndFlags(incPart);
								if(currentP.prefix && incP.prefix && currentP.prefix === incP.prefix) {
									// keep current flags first, then append incoming flags if missing
									const mergedFlags = mergeFlagTokens(currentP.flags, incP.flags);

									newParts.push(currentP.prefix + (mergedFlags.length > 0 ? ' ' + mergedFlags.join(' ') : ''));
									continue;
								}
							}

							if(currentPart) {
								newParts.push(currentPart);
							}

							if(!currentPart && incPart) {
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
					currentSegments = currentSegments.filter((s, index) => {
						if(index === j) {
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
				let previousMatch = -1;
				for(let j = incomingIndex - 1; j >= 0; j--) {
					const mi = initialMatchedIndices[j];
					if(mi >= 0) {
						const pref = splitPrefixAndFlags(incomingSegments[j]).prefix;
						const pos = currentSegments.findIndex((cs) => splitPrefixAndFlags(cs).prefix === pref);
						if(pos !== -1) {
							previousMatch = pos;
							break;
						}
					}
				}

				let nextMatch = -1;
				for(let j = incomingIndex + 1; j < incomingSegments.length; j++) {
					const mi = initialMatchedIndices[j];
					if(mi >= 0) {
						const pref = splitPrefixAndFlags(incomingSegments[j]).prefix;
						const pos = currentSegments.findIndex((cs) => splitPrefixAndFlags(cs).prefix === pref);
						if(pos !== -1) {
							nextMatch = pos;
							break;
						}
					}
				}

				const incomingBase = (splitPrefixAndFlags(incomingSegment).prefix || incomingSegment).split(' ')[0];
				let basePos: number | null = null;
				for(let k = currentSegments.length - 1; k >= 0; k--) {
					const cp = splitPrefixAndFlags(currentSegments[k]).prefix || currentSegments[k];
					const cpBase = cp.split(' ')[0];
					if(cpBase === incomingBase) {
						basePos = k;
						break;
					}
				}

				let insertPos: number;
				if((previousMatch >= 0) && (nextMatch >= 0)) {
					insertPos = previousMatch + 1;
				}
				else if((basePos !== null) && (nextMatch < 0)) {
					insertPos = basePos + 1;
				}
				else if(previousMatch >= 0) {
					insertPos = previousMatch + 1;
				}
				else if(nextMatch >= 0) {
					insertPos = nextMatch + 1;
				}
				else {
					insertPos = currentSegments.length;
				}

				currentSegments.splice(insertPos, 0, incomingSegment);
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
			let previousMatch = -1;
			for(let j = incomingIndex - 1; j >= 0; j--) {
				const mi = initialMatchedIndices[j];
				if(mi >= 0) {
					const pref = splitPrefixAndFlags(incomingSegments[j]).prefix;
					const pos = currentSegments.findIndex((cs) => splitPrefixAndFlags(cs).prefix === pref);
					if(pos !== -1) {
						previousMatch = pos;
						break;
					}
				}
			}

			let nextMatch = -1;
			for(let j = incomingIndex + 1; j < incomingSegments.length; j++) {
				const mi = initialMatchedIndices[j];
				if(mi >= 0) {
					const pref = splitPrefixAndFlags(incomingSegments[j]).prefix;
					const pos = currentSegments.findIndex((cs) => splitPrefixAndFlags(cs).prefix === pref);
					if(pos !== -1) {
						nextMatch = pos;
						break;
					}
				}
			}

			const incomingBase = (incomingPartsObject.prefix || incomingSegment).split(' ')[0];
			let basePos: number | null = null;
			for(let k = currentSegments.length - 1; k >= 0; k--) {
				const cp = splitPrefixAndFlags(currentSegments[k]).prefix || currentSegments[k];
				const cpBase = cp.split(' ')[0];
				if(cpBase === incomingBase) {
					basePos = k;
					break;
				}
			}

			let insertPos: number;
			if((previousMatch >= 0) && (nextMatch >= 0)) {
				insertPos = previousMatch + 1;
			}
			else if((basePos !== null) && (nextMatch < 0)) {
				insertPos = basePos + 1;
			}
			else if(previousMatch >= 0) {
				insertPos = previousMatch + 1;
			}
			else if(nextMatch >= 0) {
				insertPos = nextMatch + 1;
			}
			else {
				insertPos = currentSegments.length;
			}

			currentSegments.splice(insertPos, 0, incomingSegment);
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
