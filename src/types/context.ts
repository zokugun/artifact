import { Config } from './config';
import { Format } from './format';
import { TextFile } from './text-file';

export interface Context {
	binaryFiles: string[];
	config: Config;
	configInfo?: {
		name: string;
		type: string;
		finalNewLine: boolean;
	};
	formats: Format[];
	incomingPackage?: Record<string, any>;
	incomingPath: string;
	mergedTextFiles: TextFile[];
	options: {
		verbose: boolean;
	};
	// targetPackage?: Record<string, any>;
	targetPath: string;
	textFiles: TextFile[];
}
