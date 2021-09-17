export function parse(data: string): Record<string, any> {
	return JSON.parse(data) as Record<string, any>;
}

export function stringify(data: Record<string, any>): string {
	return JSON.stringify(data, null, '\t');
}
