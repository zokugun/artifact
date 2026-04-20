export type Request = {
	name: string;
	variant?: string;
};

export type PackageManifest = {
	name: string;
	version: string;
};

export type PackageConfig = {
	constants: Record<string, string>;
	extends?: string;
	install: InstallFileConfig[];
	orphan: boolean;
	uninstall: UninstallFileConfig[];
	update: false | UpdateFileConfig[];
	variables: Record<string, string>;
	variants: Record<string, string>;
};

export type Artifact = {
	version: string;
	provides?: string[];
	requires?: string[];
};

export type ArtifactResult = Artifact & { name: string };

export type InstallConfig = {
	artifacts: Record<string, Artifact>;
	constants: Record<string, string>;
	install: Record<string, InstallFileConfig>;
	update: false | Record<string, UpdateFileConfig>;
	variables: Record<string, string>;
};

export type FileConfig<E> = {
	ifExists: E;
	pattern: string;
	transforms: FileTransform[];
};

export type AlwaysFileConfig = FileConfig<'force-merge' | 'merge' | 'overwrite' | 'remove' | 'skip'>;

export type InstallFileConfig = UpsertFileConfig;

export type UninstallFileConfig = FileConfig<'remove' | 'skip' | 'unmerge'>;

export type UpdateFileConfig = UpsertFileConfig;

export type UpsertFileConfig = AlwaysFileConfig & {
	filter?: string[];
	ifMissing: 'merge' | 'skip';
	rename?: string;
	route?: Record<string, any>;
};

export type FileTransform = {
	description?: string;
	jq: string;
};

export type InstallConfigStats = {
	name: string;
	type: string;
	finalNewLine: boolean;
};
