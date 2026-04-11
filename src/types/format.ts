export enum IndentStyle {
	SPACE = 'space',
	TAB = 'tab',
}

export type Format = {
	glob: string;
	indentStyle: IndentStyle;
	indentSize: number;
	insertFinalNewline: boolean;
};
