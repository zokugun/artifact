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
	remove: boolean;
	transforms: FileTransform[];
};

export type FileUpsert = FileAlways & {
	filter?: string[];
	overwrite: boolean;
	rename?: string;
	route?: Record<string, any>;
};

export type FileInstall = FileUpsert & {
};

export type FileUninstall = FileAlways & {
	unmerge: boolean;
};

export type FileUpdate = FileUpsert & {
	missing: boolean;
	update?: boolean;
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
