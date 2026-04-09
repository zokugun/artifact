export function mergeFlagTokens(currentFlags: string[], incomingFlags: string[]): string[] {
	const mergedFlags = currentFlags.slice();

	for(const flag of incomingFlags) {
		const name = flag.split(/\s+/)[0];
		const exists = mergedFlags.some((existing) => existing.split(/\s+/)[0] === name);

		if(!exists) {
			mergedFlags.push(flag);
		}
	}

	return mergedFlags;
}
