export function toLines(value: string): string[] {
	return value.split(/\r?\n/g);
}
