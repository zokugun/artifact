export type Request = {
	name: string;
	variant?: string;
};

export type PackageManifest = {
	name: string;
	version: string;
};

export type PackageConfig = {
	constants?: Record<string, string>;
	extends?: string | number;
	install: Record<string, FileInstall>;
	orphan?: boolean;
	update: boolean | Record<string, FileUpdate>;
	variables?: Record<string, string>;
	variants?: Record<string, unknown>;
};

export type Artifact = {
	version: string;
	provides?: string[];
	requires?: string[];
};

export type ArtifactResult = Artifact & { name: string };

export type InstallConfig = {
	artifacts: Record<string, Artifact>;
	constants?: Record<string, string>;
	install: Record<string, FileInstall>;
	update: boolean | Record<string, FileUpdate>;
	variables?: Record<string, string>;
};

export type OldInstallConfig = {
	artifacts: Array<{ name: string; version: string }>;
	install: Record<string, FileInstall>;
	update: boolean | Record<string, FileUpdate>;
};

export type FileInstall = {
	filter?: string[];
	overwrite?: boolean;
	remove?: boolean;
	route?: Record<string, any>;
};

export type FileUpdate = {
	filter?: string[];
	missing?: boolean;
	overwrite?: boolean;
	route?: Record<string, any>;
	update?: boolean;
};

export type InstallConfigStats = {
	name: string;
	type: string;
	finalNewLine: boolean;
};
