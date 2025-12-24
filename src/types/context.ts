import { BinaryFile } from './binary-file';
import { Request, InstallConfig, PackageConfig, ArtifactResult, PackageManifest } from './config';
import { Format } from './format';
import { TextFile } from './text-file';
import { Journey } from './travel';

export type Context = {
	packagePath: string;
	request: Request;
	binaryFiles: BinaryFile[];
	config: InstallConfig;
	filters: (file: string) => string[] | undefined;
	formats: Format[];
	incomingName?: string;
	incomingVersion?: string;
	incomingVariant?: string;
	incomingBranch?: string;
	incomingConfig?: PackageConfig;
	incomingPackage?: PackageManifest;
	incomingPath: string;
	mergedTextFiles: TextFile[];
	onExisting: (file: string) => 'merge' | 'overwrite' | 'skip';
	onMissing: (file: string) => 'continue' | 'skip';
	options: Options;
	removedPatterns: string[];
	routes: (file: string) => Journey | undefined;
	targetPath: string;
	textFiles: TextFile[];
	commonFlow: CommonFlow;
	blocks: Block[];
	result?: ArtifactResult;
};

export type MainFlow = (targetPath: string, incomingPath: string, request: Request, config: InstallConfig, options: Options) => Promise<Context | undefined>;
export type CommonFlow = (name: string, version: string, variant: string | undefined, branch: string | undefined, incomingPath: string, commonContext: Context) => Promise<Context | undefined>;

export type Options = {
	force: boolean;
	skip: boolean;
	verbose: boolean;
};

export type Block = {
	name: string;
	version: string;
	variant?: string;
	branch?: string;
	incomingPath: string;
};
