import path from 'path';
import { logger } from '@zokugun/cli-utils';
import fse from '@zokugun/fs-extra-plus/async';
import { isNonEmptyRecord, type Primitive } from '@zokugun/is-it-type';
import { type AsyncDResult, err, OK, stringifyError } from '@zokugun/xtry';
import yaml from 'yaml';
import { applyFormatting } from '../../steps/apply-formatting.js';
import { insertFinalNewLine } from '../../steps/insert-final-new-line.js';
import { type Artifact, type UpdateFileConfig, type InstallConfig, type InstallConfigStats } from '../../types/config.js';
import { type Options } from '../../types/context.js';
import { type Format } from '../../types/format.js';
import { MAX_VERSION, VERSION_RELEASE } from '../utils/constants.js';

export async function writeInstallConfig(config: InstallConfig, { name, finalNewLine, indent, type }: InstallConfigStats, formats: Format[], targetPath: string, options: Options): AsyncDResult {
	const exported: {
		$schema: string;
		artifacts: Record<string, Artifact>;
		update?: boolean | Record<string, UpdateFileConfig>;
		variables?: Record<string, Primitive>;
	} = {
		$schema: `https://raw.githubusercontent.com/zokugun/artifact/v${VERSION_RELEASE}/schemas/v${MAX_VERSION}/install.json`,
		artifacts: config.artifacts,
	};

	if(isNonEmptyRecord(config.update)) {
		exported.update = config.update;
	}

	if(isNonEmptyRecord(config.variables)) {
		exported.variables = config.variables;
	}

	const file = {
		name,
		data: type === 'yaml' ? yaml.stringify(exported) : JSON.stringify(exported, null, '\t'),
		indent,
		finalNewLine,
	};

	await insertFinalNewLine({ mergedTextFiles: [file] });
	await applyFormatting({ mergedTextFiles: [file], formats });

	if(!options.dryRun) {
		const filePath = path.join(targetPath, name);

		const result = await fse.outputFile(filePath, file.data, 'utf8');
		if(result.fails) {
			return err(stringifyError(result.error));
		}
	}

	if(options.verbose) {
		logger.debug(`${name} has been written`);
	}

	return OK;
}
