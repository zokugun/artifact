import process from 'node:process';
import { c, logger } from '@zokugun/cli-utils';
import fse from '@zokugun/fs-extra-plus/async';
import { stringifyError } from '@zokugun/xtry';
import { readInstallConfig } from '../configs/index.js';
import { type Artifact, type PackageManifest } from '../types/config.js';
import { formatTable } from '../utils/format-table.js';

function formatVariant(artifact: Artifact): string {
	const variant = Array.isArray(artifact.requires) ? artifact.requires.at(-1) ?? '' : '';

	if(variant.length > 0) {
		return `:${variant}`;
	}
	else {
		return '';
	}
}

export async function list(): Promise<void> {
	const targetPath = process.cwd();

	const configResult = await readInstallConfig(targetPath);
	if(configResult.fails) {
		logger.fatal(configResult.error);
	}

	const packageResult = await fse.readJSON(fse.resolve(targetPath, './package.json'));
	if(packageResult.fails) {
		logger.fatal(stringifyError(packageResult.error));
	}

	const { name } = packageResult.value as PackageManifest;

	const config = configResult.value;

	const artifacts = Object.entries(config.artifacts);

	logger.newLine();

	if(artifacts.length === 0) {
		logger.info('No artifacts have been installed.');
	}
	else {
		logger.print(`${name} ${c.grey(config.file.name)}`);
		logger.newLine();

		const table: string[][] = [];

		for(const [name, artifact] of artifacts) {
			const line: string[] = [
				' ',
				name,
				' ',
				artifact.version ? `${c.green(artifact.version)}${c.gray(formatVariant(artifact))}` : '',
			];

			table.push(line);
		}

		const lines = formatTable(table, 'LLLL');

		logger.print(lines.join('\n'));
	}

	logger.newLine();
}
