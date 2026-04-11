export function tryJSON(value: string): Record<string, unknown> | undefined {
	try {
		return JSON.parse(value) as Record<string, unknown>;
	}
	catch {
		return undefined;
	}
}
