import { logger } from '@zokugun/cli-utils';
import fse from '@zokugun/fs-extra-plus/async';
import { type AsyncDResult, OK } from '@zokugun/xtry';
import globby from 'globby';
import { type InstallConfig } from '../types/config.js';
import { type FlowEntry, type OperationType, type Options, type Global } from '../types/context.js';
import { pushEntry } from './push-entry.js';

export async function resolveBranches(entry: FlowEntry, operationType: OperationType, entries: FlowEntry[], variants: string[], features: string[], _config: InstallConfig, global: Global, options: Options): AsyncDResult {
	const cwd = fse.join(entry.dir, 'branches');

	if(await fse.isExisting(cwd)) {
		const directories = await globby('*', {
			cwd,
			deep: 1,
			onlyDirectories: true,
		});

		for(const directory of directories) {
			const depMatch = /^\[(@[\w-]+:[\w-]+|[\w-]+)(?::([\w-]+))?]$/.exec(directory);

			if(depMatch) {
				const [branch, name, variant] = depMatch;
				const packageName = name
					.replaceAll(/^(?!@)(artifact-)?/g, 'artifact-')
					.replaceAll(/:(artifact-)?/g, '/artifact-');
				const found = variants.includes(variant ? `${packageName}:${variant}` : packageName);

				if(found) {
					if(options.verbose) {
						logger.debug(`- branch: ${name}${variant ? `:${variant}` : ''} has been matched`);
					}

					const result = await pushEntry({ ...entry, branch, dir: fse.join(cwd, directory) }, false, undefined, entries, features, operationType, global);
					if(result.fails) {
						return result;
					}
				}
				else {
					if(options.verbose) {
						logger.debug(`- branch: ${name}${variant ? `:${variant}` : ''} hasn't been matched (${variant ? 'variant' : 'artifact'} not found)`);
					}
				}

				continue;
			}

			const featMatch = /^\[#(all|any):(!?\w+(?:,!?\w+)*)]$/.exec(directory);

			if(featMatch) {
				const branch = featMatch[0];
				const logic = featMatch[1];
				const feats = featMatch[2].split(',');

				let found = false;

				if(logic === 'all') {
					found = true;

					for(const feat of feats) {
						if(feat.startsWith('!')) {
							if(features.includes(feat.slice(1))) {
								found = false;
								break;
							}
						}
						else {
							if(!features.includes(feat)) {
								found = false;
								break;
							}
						}
					}
				}
				else if(logic === 'any') {
					found = false;

					for(const feat of feats) {
						if(feat.startsWith('!')) {
							if(!features.includes(feat.slice(1))) {
								found = true;
								break;
							}
						}
						else {
							if(features.includes(feat)) {
								found = true;
								break;
							}
						}
					}
				}

				if(found) {
					if(options.verbose) {
						logger.debug(`- branch: ${entry.name}${entry.variant ? `:${entry.variant}` : ''} has been matched`);
					}

					const result = await pushEntry({ ...entry, branch, dir: fse.join(cwd, directory) }, false, undefined, entries, features, operationType, global);
					if(result.fails) {
						return result;
					}
				}
			}
		}
	}

	return OK;
}
