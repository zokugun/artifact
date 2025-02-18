export function tryJson(value: string): Record<string, any> | undefined {
	try {
		return JSON.parse(value) as Record<string, any>;
	}
	catch {
		return undefined;
	}
}
