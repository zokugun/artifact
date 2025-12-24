import path from 'path';
import fse from 'fs-extra';
import { isEmpty, isPlainObject } from 'lodash';
import yaml from 'yaml';
import { applyFormatting } from '../../steps/apply-formatting';
import { insertFinalNewLine } from '../../steps/insert-final-new-line';
import { Artifact, FileUpdate, InstallConfig, InstallConfigStats } from '../../types/config';
import { Options } from '../../types/context';
import { Format } from '../../types/format';

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

	const filePath = path.join(targetPath, name);

	await fse.outputFile(filePath, file.data, 'utf-8');

	if(options.verbose) {
		console.log(`${name} has been written`);
	}
}
