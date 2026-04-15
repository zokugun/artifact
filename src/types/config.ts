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
	install: Record<string, FileInstall>;
	orphan: boolean;
	uninstall: Record<string, FileUninstall>;
	update: false | Record<string, FileUpdate>;
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
	install: Record<string, FileInstall>;
	update: false | Record<string, FileUpdate>;
	variables: Record<string, string>;
};

export type FileAlways = {
	ifExists: 'force-merge' | 'merge' | 'overwrite' | 'remove' | 'skip';
	transforms: FileTransform[];
};

export type FileUpsert = FileAlways & {
	filter?: string[];
	ifMissing: 'merge' | 'skip';
	rename?: string;
	route?: Record<string, any>;
};

export type FileInstall = FileUpsert & {
};

export type FileUninstall = {
	ifExists: 'remove' | 'skip' | 'unmerge';
	transforms: FileTransform[];
};

export type FileUpdate = FileUpsert & {
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
