import path from 'path';
import fse from '@zokugun/fs-extra-plus/async';
import { isArray, isPrimitive, isRecord, isString, type Primitive } from '@zokugun/is-it-type';
import { type AsyncDResult, type DResult, err, ok } from '@zokugun/xtry';
import yaml from 'yaml';
import { type Artifact, type InstallFileConfig, type UpdateFileConfig, type InstallConfig, type InstallConfigStats } from '../../types/config.js';
import { detectIndent } from '../../utils/detect-indent.js';
import { hasFinalNewLine } from '../../utils/has-final-new-line.js';
import { MAX_VERSION, CONFIG_LOCATIONS, VERSION_INSTALL_REGEX } from '../utils/constants.js';
import { normalizeFileUpsert } from '../utils/normalize-file-upsert.js';

export async function readInstallConfig(targetPath: string): AsyncDResult<{ config: InstallConfig; configStats: InstallConfigStats }> {
	let content: string | undefined;
	let name: string | undefined;
	let type: string | undefined;

	for(const place of CONFIG_LOCATIONS) {
		const result = await fse.readFile(path.join(targetPath, place.name), 'utf8');
		if(!result.fails) {
			content = result.value;

			({ name, type } = place);
		}
	}

	if(!content || !name) {
		return normalizeConfig(content, {
			name: '.artifactrc.yml',
			type: 'yaml',
			finalNewLine: true,
		});
	}

	const finalNewLine = hasFinalNewLine(content);
	const indent = detectIndent(content);

	if(type === 'json') {
		return normalizeConfig(JSON.parse(content), {
			name,
			type: 'json',
			finalNewLine,
			indent,
		});
	}
	else if(type === 'yaml') {
		return normalizeConfig(yaml.parse(content), {
			name,
			type: 'yaml',
			finalNewLine,
			indent,
		});
	}
	else {
		try {
			return normalizeConfig(JSON.parse(content), {
				name,
				type: 'json',
				finalNewLine,
				indent,
			});
		}
		catch {
			return normalizeConfig(yaml.parse(content), {
				name,
				type: 'yaml',
				finalNewLine,
				indent,
			});
		}
	}
}

function normalizeConfig(data: unknown, configStats: InstallConfigStats): DResult<{ config: InstallConfig; configStats: InstallConfigStats }> { // {{{
	const artifacts: Record<string, Artifact> = {};
	let constants: Record<string, Primitive> = {};
	const install: Record<string, InstallFileConfig> = {};
	let update: boolean | Record<string, UpdateFileConfig> = {};
	let variables: Record<string, Primitive> = {};

	if(!data) {
		return ok({
			config: {
				artifacts,
				constants,
				install,
				update,
				variables,
			},
			configStats,
		});
	}

	if(!isRecord(data)) {
		return err(`Config file ${configStats.name} must export an object.`);
	}

	if(isString(data.$schema)) {
		const match = VERSION_INSTALL_REGEX.exec(data.$schema);
		if(!match) {
			return err(`Cannot validate the "$schema" in the project's "${configStats.name}".`);
		}

		const version = Number.parseInt(match[2], 10);
		if(version > MAX_VERSION) {
			return err(`Don't support newer version (v${version}) in the project's "${configStats.name}".`);
		}
	}

	if(isArray(data.artifacts)) {
		for(const artifact of data.artifacts) {
			if(isRecord(artifact) && isString(artifact.name) && isString(artifact.version)) {
				const normalized: Artifact = {
					version: artifact.version,
				};

				if(isString(artifact.variant)) {
					normalized.requires = [artifact.variant];
				}

				artifacts[artifact.name] = normalized;
			}
		}
	}
	else if(isRecord(data.artifacts)) {
		for(const [key, artifact] of Object.entries(data.artifacts)) {
			if(isRecord(artifact) && isString(artifact.version)) {
				const normalized: Artifact = {
					version: artifact.version,
				};

				if(isArray<string>(artifact.requires, isString)) {
					normalized.requires = artifact.requires;
				}
				else if(isArray<string>(artifact.provides, isString)) {
					normalized.requires = artifact.provides;
				}

				artifacts[key] = normalized;
			}
		}
	}

	if(isRecord<Primitive>(data.constants, (_key, value) => isPrimitive(value))) {
		constants = data.constants;
	}

	if(data.update === false) {
		update = false;
	}
	else if(isRecord(data.update)) {
		for(const [key, value] of Object.entries(data.update)) {
			const normalized = normalizeFileUpsert(key, value, 'update');
			if(normalized.fails) {
				return normalized;
			}

			update[key] = normalized.value;
		}
	}

	if(isRecord<Primitive>(data.variables, (_key, value) => isPrimitive(value))) {
		variables = data.variables;
	}

	return ok({
		config: {
			artifacts,
			constants,
			install,
			update,
			variables,
		},
		configStats,
	});
}
