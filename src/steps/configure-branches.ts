import path from 'node:path';
import fse from 'fs-extra';
import globby from 'globby';
import { Block, Context } from '../types/context';

export async function configureBranches(context: Context): Promise<void> {
	const cwd = path.join(context.incomingPath, 'branches');

	if(await fse.pathExists(cwd)) {
		const directories = await globby('*', {
			cwd,
			onlyDirectories: true,
		});

		const bucket: Block[] = [];

		for(const directory of directories) {
			const match = /^\[(@[\w-]+:[\w-]+|[\w-]+)(?::([\w-]+))?]$/.exec(directory);

			if(match) {
				const [branch, name, variant] = match;
				const packageName = name.replace(/:/g, '/');
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
					bucket.push({
						name: context.incomingName!,
						version: context.incomingVersion!,
						variant: context.incomingVariant,
						branch,
						incomingPath: path.join(cwd, directory),
					});
				}
			}
		}

		context.blocks.unshift(...bucket);
	}
}
