const FINAL_LINE_REGEX = /\r\n|\r|\n$/;

export function hasFinalNewLine(text: string): boolean {
	return FINAL_LINE_REGEX.test(text);
}
