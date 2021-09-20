export function mapConcat({ current, incoming }: { current: Record<string, any> | undefined; incoming: Record<string, any> | undefined }): Record<string, any> {
	if(!incoming) {
		return current ?? {};
	}

	if(!current) {
		return incoming;
	}

	return { ...current, ...incoming };
}
