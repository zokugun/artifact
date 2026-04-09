export function dedupeStrings(items: string[]): string[] {
	const result: string[] = [];
	for(const item of items) {
		if(!result.includes(item)) {
			result.push(item);
		}
	}

	return result;
}
