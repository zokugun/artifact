export async function overwrite({ current, incoming }: { current: unknown | undefined; incoming: unknown | undefined }): Promise<unknown> {
	if(incoming === undefined) {
		return current ?? [];
	}
	else {
		return incoming;
	}
}
