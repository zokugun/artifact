import path from 'path';
import { logger } from '@zokugun/cli-utils';
import fse from 'fs-extra';
import { isEmpty, isPlainObject } from 'lodash-es';
import yaml from 'yaml';
import { applyFormatting } from '../../steps/apply-formatting.js';
import { insertFinalNewLine } from '../../steps/insert-final-new-line.js';
import { type Artifact, type FileUpdate, type InstallConfig, type InstallConfigStats } from '../../types/config.js';
import { type Options } from '../../types/context.js';
import { type Format } from '../../types/format.js';

export async function writeInstallConfig(config: InstallConfig, { name, finalNewLine, type }: InstallConfigStats, formats: Format[], targetPath: string, options: Options): Promise<void> {
	const exported: {
		artifacts: Record<string, Artifact>;
		update?: boolean | Record<string, FileUpdate>;
	} = {
		artifacts: config.artifacts,
	};

	if(!isPlainObject(config.update) || !isEmpty(config.update)) {
		exported.update = config.update;
	}

	const file = {
		name,
		data: type === 'yaml' ? yaml.stringify(exported) : JSON.stringify(exported, null, '\t'),
		finalNewLine,
	};

	await insertFinalNewLine({ mergedTextFiles: [file] });
	await applyFormatting({ mergedTextFiles: [file], formats });

	if(!options.dryRun) {
		const filePath = path.join(targetPath, name);

		await fse.outputFile(filePath, file.data, 'utf8');
	}

	if(options.verbose) {
		logger.debug(`${name} has been written`);
	}
}
