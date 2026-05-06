import { type Primitive } from '@zokugun/is-it-type';
import { type Indent } from './format.js';
import { type JourneyPlan, type Route } from './travel.js';

export type Request = {
	name: string;
	variant?: string;
};

export type PackageManifest = {
	name: string;
	version: string;
};

export type PackageConfig = {
	extends?: string;
	install: InstallFileConfig[];
	journeys: Record<string, JourneyPlan>;
	orphan: boolean;
	routes: Record<string, Route<any>>;
	uninstall: UninstallFileConfig[];
	update: false | UpdateFileConfig[];
	variables: Record<string, Primitive>;
	variants: Record<string, string>;
};

export type Artifact = {
	version: string;
	provides?: string[];
	requires?: string[];
};

export type ArtifactResult = Artifact & { name: string };

export type InstallConfig = {
	file: {
		name: string;
		finalNewLine: boolean;
		indent?: Indent;
		type: string;
	};
	global: {
		journeys: Record<string, JourneyPlan>;
		routes: Record<string, Route<any>>;
	};
	local: {
		artifacts: Record<string, Artifact>;
		install: Record<string, InstallFileConfig>;
		journeys: Record<string, JourneyPlan>;
		routes: Record<string, Route<any>>;
		update: false | Record<string, UpdateFileConfig>;
		variables: Record<string, Primitive>;
	};
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
};

export type FileTransform = {
	description?: string;
	jq: string;
};
