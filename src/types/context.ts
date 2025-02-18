import { BinaryFile } from './binary-file';
import { Config } from './config';
import { Format } from './format';
import { TextFile } from './text-file';
import { Journey } from './travel';

export interface Context {
	binaryFiles: BinaryFile[];
	config: Config;
	filters: (file: string) => string[] | undefined;
	formats: Format[];
	incomingConfig?: Config;
	incomingPackage?: Record<string, any>;
	incomingPath: string;
	mergedTextFiles: TextFile[];
	onMissing: (file: string) => boolean;
	onUpdate: (file: string) => boolean;
	options: Options;
	routes: (file: string) => Journey | undefined;
	targetPath: string;
	textFiles: TextFile[];
}

export interface Options {
	force: boolean;
	skip: boolean;
	verbose: boolean;
}
