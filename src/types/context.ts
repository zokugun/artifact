import { type BinaryFile } from './binary-file.js';
import { type Request, type InstallConfig, type PackageConfig, type ArtifactResult, type PackageManifest } from './config.js';
import { type Format } from './format.js';
import { type TextFile } from './text-file.js';
import { type Journey } from './travel.js';

export type ExistingAction = 'merge' | 'overwrite' | 'skip';
export type MissingAction = 'continue' | 'skip';
export type RenameAction = {
	from: string;
	to: string;
};

export type Context = {
	binaryFiles: BinaryFile[];
	blocks: Block[];
	commonFlow: CommonFlow;
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
	onExisting: (file: string) => ExistingAction;
	onMissing: (file: string) => MissingAction;
	options: Options;
	packagePath: string;
	removedPatterns: string[];
	renamedPatterns: RenameAction[];
	request: Request;
	result?: ArtifactResult;
	routes: (file: string) => Journey | undefined;
	targetPath: string;
	textFiles: TextFile[];
};

export type MainFlow = (targetPath: string, incomingPath: string, request: Request, config: InstallConfig, options: Options) => Promise<Context | undefined>;
export type CommonFlow = (name: string, version: string, variant: string | undefined, branch: string | undefined, incomingPath: string, commonContext: Context) => Promise<Context | undefined>;

export type Options = {
	force: boolean;
	skip: boolean;
	verbose: boolean;
	dryRun: boolean;
};

export type Block = {
	name: string;
	version: string;
	variant?: string;
	branch?: string;
	incomingPath: string;
};
