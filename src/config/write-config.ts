import path from 'path';
import yaml from 'yaml';
import fse from 'fs-extra';
import { isEmpty, isPlainObject } from 'lodash';
import { Config, ConfigStats } from '../types/config';
import { Options } from '../types/context';
import { insertFinalNewLine } from '../steps/insert-final-new-line';
import { Format } from '../types/format';
import { applyFormatting } from '../steps/apply-formatting';

export async function writeConfig({ artifacts, update }: Config, { name, finalNewLine, type }: ConfigStats, formats: Format[], targetPath: string, options: Options): Promise<void> {
	const exported: {
		artifacts: Array<{
			name: string;
			version: string;
		}>;
		update?: boolean | {
			excludes?: string[];
		};
	} = {
		artifacts: [...artifacts],
	};

	if(!isPlainObject(update) || !isEmpty(update)) {
		exported.update = update;
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
