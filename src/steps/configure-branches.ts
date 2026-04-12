import path from 'node:path';
import { logger } from '@zokugun/cli-utils';
import fse from '@zokugun/fs-extra-plus/async';
import { type AsyncDResult, OK } from '@zokugun/xtry';
import globby from 'globby';
import { type Block, type Context } from '../types/context.js';

export async function configureBranches(context: Context): AsyncDResult {
	const cwd = path.join(context.incomingPath, 'branches');

	if(await fse.isExisting(cwd)) {
		const directories = await globby('*', {
			cwd,
			onlyDirectories: true,
		});

		const bucket: Block[] = [];

		for(const directory of directories) {
			const match = /^\[(@[\w-]+:[\w-]+|[\w-]+)(?::([\w-]+))?]$/.exec(directory);

			if(match) {
				const [branch, name, variant] = match;
				const packageName = name.replaceAll(/:(artifact-)?/g, '/artifact-');
				const artifact = context.config.artifacts[packageName];
				let found = false;

				if(artifact) {
					if(variant) {
						if(Array.isArray(artifact.requires)) {
							if(artifact.requires.includes(variant)) {
								found = true;
							}
						}
						else if(Array.isArray(artifact.provides)) {
							if(artifact.provides.includes(variant)) {
								found = true;
							}
						}
						else {
							found = true;
						}
					}
					else {
						found = true;
					}
				}

				if(found) {
					if(context.options.verbose) {
						logger.debug(`- branch: ${name}${variant ? `:${variant}` : ''} has been matched`);
					}

					bucket.push({
						name: context.incomingName!,
						version: context.incomingVersion!,
						variant: context.incomingVariant,
						branch,
						incomingPath: path.join(cwd, directory),
					});
				}
				else {
					if(context.options.verbose) {
						logger.debug(`- branch: ${name}${variant ? `:${variant}` : ''} hasn't been matched (${artifact ? 'variant' : 'artifact'} not found)`);
					}
				}
			}
		}

		context.blocks.unshift(...bucket);
	}

	return OK;
}
