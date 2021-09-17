export function overwrite({ current, incoming }: { current: unknown | undefined; incoming: unknown | undefined }): unknown {
	if(!incoming) {
		return current ?? [];
	}
	else {
		return incoming;
	}
}
