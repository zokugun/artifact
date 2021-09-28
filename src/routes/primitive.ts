export function primitive({ current, incoming }: { current: unknown | undefined; incoming: unknown | undefined }): unknown {
	if(typeof incoming === 'undefined') {
		return current ?? [];
	}

	if(typeof current === 'undefined') {
		return incoming;
	}

	if(current === incoming) {
		return current;
	}
	else {
		return incoming;
	}
}
