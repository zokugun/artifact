import path from 'node:path';
import process from 'process';
import { c, logger } from '@zokugun/cli-utils';
import fse from '@zokugun/fs-extra-plus/async';
import { stringifyError } from '@zokugun/xtry';
import { SingleBar, Presets } from 'cli-progress';
import pacote from 'pacote';
import { gt } from 'semver';
import { readInstallConfig } from '../configs/index.js';
import { type PackageManifest } from '../types/config.js';
import { formatTable } from '../utils/format-table.js';
import { timeDifference } from '../utils/time-difference.js';

export async function outdated(): Promise<void> {
	const targetPath = process.cwd();

	const configResult = await readInstallConfig(targetPath);
	if(configResult.fails) {
		logger.fatal(configResult.error);
	}

	const packageResult = await fse.readJSON(path.resolve(targetPath, './package.json'));
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

		const bar = new SingleBar({
			clearOnComplete: true,
			hideCursor: true,
			format: `{bar} {value}/{total} ${c.gray('{name}')}`,
			linewrap: false,
			barsize: 40,
		}, Presets.shades_classic);

		bar.start(artifacts.length, 0);

		const table: string[][] = [];

		for(const [index, [name, artifact]] of artifacts.entries()) {
			const current = await pacote.manifest(`${name}@${artifact.version}`, {
				fullMetadata: true,
			});
			const latest = await pacote.manifest(name, {
				fullMetadata: true,
			});

			const newer = gt(latest.version, artifact.version);

			const line: string[] = [
				' ',
				newer ? name : c.grey(name),
				' ',
				timeDifference(current._time as string),
				artifact.version ? c.grey(artifact.version) : '',
				c.dim.grey('→'),
				newer ? latest.version : c.grey.strikethrough(latest.version),
				newer ? timeDifference(latest._time as string) : '',
			];

			table.push(line);

			bar.update(index, { name });
		}

		bar.stop();

		logger.newLine();

		const lines = formatTable(table, 'LLLLRRRL');

		logger.print(lines.join('\n'));
	}

	logger.newLine();
}
