export function listSortConcat({ current, incoming }: { current: unknown[] | undefined; incoming: unknown[] | undefined }): any[] {
	if(!incoming) {
		return current ?? [];
	}

	if(!current) {
		return incoming;
	}

	const sorting: number[] = [];
	const weight2values: Record<number, unknown> = {};
	const hash2weights: Record<string, number> = {};
	let lastWeight = 0;

	for(const [index, value] of current.entries()) {
		const hash = JSON.stringify(value);

		if(!hash2weights[hash]) {
			const weight = (index + 1) * 1000;

			hash2weights[hash] = weight;
			weight2values[weight] = value;

			sorting.push(weight);

			lastWeight = weight;
		}
	}

	let currentWeight = lastWeight;

	for(const value of incoming) {
		const hash = JSON.stringify(value);

		if(hash2weights[hash]) {
			currentWeight = hash2weights[hash];
		}
		else {
			++currentWeight;

			hash2weights[hash] = currentWeight;
			weight2values[currentWeight] = value;

			sorting.push(currentWeight);
		}
	}

	sorting.sort((a, b) => a - b);

	const result = sorting.map((weight) => weight2values[weight]);

	return result;
}
