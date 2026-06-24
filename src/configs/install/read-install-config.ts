import path from 'path';
import fse from '@zokugun/fs-extra-plus/async';
import { isArray, isPrimitive, isRecord, isString, type Primitive } from '@zokugun/is-it-type';
import { type AsyncDResult, type DResult, err, ok } from '@zokugun/xtry';
import yaml from 'yaml';
import { type ArtifactConfig, type InstallFileConfig, type UpdateFileConfig, type InstallConfig, type UpsertFileConfig } from '../../types/config.js';
import { type JourneyPlan, type Route } from '../../types/travel.js';
import { detectIndent } from '../../utils/detect-indent.js';
import { hasFinalNewLine } from '../../utils/has-final-new-line.js';
import { MAX_VERSION, CONFIG_LOCATIONS, VERSION_INSTALL_REGEX } from '../utils/constants.js';
import { normalizeFileUpsert } from '../utils/normalize-file-upsert.js';

export async function readInstallConfig(targetPath: string): AsyncDResult<InstallConfig> {
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

function normalizeConfig(data: unknown, file: InstallConfig['file']): DResult<InstallConfig> { // {{{
	const artifacts: Record<string, ArtifactConfig> = {};
	const install: Record<string, InstallFileConfig> = {};
	const journeys: Record<string, JourneyPlan> = {};
	const routes: Record<string, Route<any>> = {};
	let update: boolean | Record<string, UpdateFileConfig> = {};
	let variables: Record<string, Primitive> = {};

	if(!data) {
		return ok({
			file,
			artifacts,
			install,
			journeys,
			routes,
			update,
			variables,
		});
	}

	if(!isRecord(data)) {
		return err(`Config file ${file.name} must export an object.`);
	}

	let version = 999;

	if(isString(data.$schema)) {
		const match = VERSION_INSTALL_REGEX.exec(data.$schema);
		if(!match) {
			return err(`Cannot validate the "$schema" in the project's "${file.name}".`);
		}

		version = Number.parseInt(match[2], 10);
		if(version > MAX_VERSION) {
			return err(`Don't support newer version (v${version}) in the project's "${file.name}".`);
		}
	}

	if(isArray(data.artifacts)) {
		for(const artifact of data.artifacts) {
			if(isRecord(artifact) && isString(artifact.name) && isString(artifact.version)) {
				const normalized: ArtifactConfig = {
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
				const normalized: ArtifactConfig = {
					version: artifact.version,
				};

				if(isArray<string>(artifact.requires, isString)) {
					normalized.requires = artifact.requires;
				}

				if(isArray<string>(artifact.provides, isString)) {
					normalized.provides = artifact.provides;
				}

				if(isArray<string>(artifact.features, isString)) {
					normalized.features = artifact.features;
				}

				if(artifact.update === false) {
					normalized.update = { data: false, config: false };
				}
				else if(isRecord(artifact.update)) {
					const config: UpsertFileConfig[] = [];

					for(const [key, value] of Object.entries(artifact.update)) {
						const normalizedUpdate = normalizeFileUpsert(key, value, 'update', version);
						if(normalizedUpdate.fails) {
							return normalizedUpdate;
						}

						config.push(normalizedUpdate.value);
					}

					normalized.update = {
						data: artifact.update,
						config,
					};
				}

				artifacts[key] = normalized;
			}
		}
	}

	if(data.update === false) {
		update = false;
	}
	else if(isRecord(data.update)) {
		for(const [key, value] of Object.entries(data.update)) {
			const normalized = normalizeFileUpsert(key, value, 'update', version);
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
		file,
		artifacts,
		install,
		journeys,
		routes,
		update,
		variables,
	});
} // }}}
