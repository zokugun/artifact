export enum IndentStyle {
	SPACE = 'space',
	TAB = 'tab',
}

export interface Format {
	glob: string;
	indentStyle: IndentStyle;
	indentSize: number;
	insertFinalNewline: boolean;
}
