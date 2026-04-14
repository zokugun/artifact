export async function primitive({ current, incoming }: { current: unknown | undefined; incoming: unknown | undefined }): Promise<unknown> {
	if(incoming === undefined) {
		return current ?? [];
	}

	if(current === undefined) {
		return incoming;
	}

	if(current === incoming) {
		return current;
	}
	else {
		return incoming;
	}
}
