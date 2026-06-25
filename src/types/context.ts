import { type Primitive } from '@zokugun/is-it-type';
import { type DResult, type AsyncDResult } from '@zokugun/xtry';
import { type Transform } from '../parsers/jsonc/transform.js';
import { type InstallConfig, type PackageConfig, type ArtifactResult, type PackageManifest, type FileTransform, type RouteSpec } from './config.js';
import { type Indent, type Format } from './format.js';
import { type JourneyPlan, type Journey } from './travel.js';

export type ExistingAction = 'merge' | 'overwrite' | 'skip';
export type MissingAction = 'continue' | 'skip';
export type RenameAction = {
	from: string;
	to: string;
};

export type Context = {
	binaryFiles: BinaryFile[];
	config: InstallConfig;
	filters: (file: string) => string[] | undefined;
	formats: Format[];
	global: Global;
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
	operationMode: OperationMode;
	operationType: OperationType;
	options: Options;
	patchFiles: PatchFile[];
	removedPatterns: string[];
	renamedPatterns: RenameAction[];
	result?: ArtifactResult;
	routes: (file: string) => Journey | undefined;
	targetPath: string;
	textFiles: TextFile[];
	transformedFiles: TextFile[];
	transforms: (file: string) => FileTransform[] | undefined;
};

export enum OperationMode {
	Default,
	OnlyTouched,
}

export enum OperationType {
	Install = 'install',
	Update = 'update',
	Uninstall = 'uninstall',
}

export type Global = {
	before?: Date;
	journeys: Record<string, JourneyPlan>;
	routes: Record<string, RouteSpec>;
	touchedTextFiles: string[];
};

export type CommonFlow = (targetPath: string, incoming: { name: string; version: string; variant: string | undefined; branch: string | undefined; dir: string; config: PackageConfig } | undefined, incomingPath: string | undefined, label: string, operationMode: OperationMode, result: ArtifactResult | undefined, config: InstallConfig, global: Global, options: Options) => AsyncDResult<Context | undefined>;

export type FlowEntry = {
	branch?: string;
	config: PackageConfig;
	dir: string;
	name: string;
	operationMode: OperationMode;
	result?: ArtifactResult;
	variant?: string;
	version: string;
};

export type ConfigUpdater = (config: InstallConfig, artifact: ArtifactResult) => void;

export type Options = {
	force: boolean;
	skip: boolean;
	verbose: boolean;
	dryRun: boolean;
	variables: Record<string, Primitive>;
};

export type BinaryFile = {
	source: string;
	target: string;
};

export type TextFile = {
	data: string;
	finalNewLine: boolean;
	indent?: Indent;
	mode?: number;
	name: string;
};

export type ParseResult = DResult<{
	data: Record<string, unknown>;
	transform?: Transform;
}>;

export type Codec = {
	parse: (data: string) => ParseResult;
	stringify: (data: Record<string, unknown>, transform?: Transform) => string;
};

export type PatchFile = {
	name: string;
	patchName: string;
	type: 'json-patch' | 'patch';
};
