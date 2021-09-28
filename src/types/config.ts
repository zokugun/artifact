export interface Config {
	artifacts: Array<{
		name: string;
		version: string;
	}>;
	update: boolean | Record<string, FileUpdate>;
}

export interface FileUpdate {
	filter?: string[];
	missing?: boolean;
	route?: Record<string, any>;
	update?: boolean;
}

export interface ConfigStats {
	name: string;
	type: string;
	finalNewLine: boolean;
}
