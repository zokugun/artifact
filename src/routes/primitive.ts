export function primitive({ current, incoming }: { current: unknown | undefined; incoming: unknown | undefined }): unknown {
	if(!incoming) {
		return current ?? [];
	}

	if(!current) {
		return incoming;
	}

	if(current === incoming) {
		return current;
	}
	else {
		return incoming;
	}
}
