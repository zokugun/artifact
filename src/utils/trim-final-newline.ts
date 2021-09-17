const FINAL_NEWLINE_REGEX = /(\r?\n)*$/;

export function trimFinalNewLine(value: string): string {
	return value.replace(FINAL_NEWLINE_REGEX, '');
}
