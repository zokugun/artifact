import { createWriteStream } from 'fs';
import process from 'process';
import pacote from 'pacote';
import tempy from 'tempy';
import npm from 'npm';
import { composeSteps, steps } from '../steps';
import { readConfig, writeConfig } from '../config';

const commonFlow = composeSteps(
	steps.readIncomingPackage,
	steps.validateNewerPackage,
	steps.readIncomingConfig,
	steps.validateUpdatability,
	steps.readFiles,
	steps.readEditorConfig,
	steps.mergeTextFiles,
	steps.insertFinalNewLine,
	steps.applyFormatting,
	steps.copyBinaryFiles,
	steps.writeTextFiles,
);

export async function update(inputOptions?: { force?: boolean; verbose?: boolean }): Promise<void> {
	// @ts-expect-error log property isn't exposed
	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	npm.log.stream = createWriteStream('/dev/null');

	await npm.load();

	const registry = npm.config.get('registry') as string;
	const targetPath = process.env.INIT_CWD!;

	const options = {
		force: inputOptions?.force ?? false,
		skip: false,
		verbose: inputOptions?.verbose ?? false,
	};

	const [config, configStats] = await readConfig(targetPath);

	for(const artifact of config.artifacts) {
		const dir = tempy.directory();
		const pkgResult = await pacote.extract(artifact.name, dir, { registry });

		if(!pkgResult.resolved) {
			if(options.force) {
				if(options.verbose) {
					console.log(`The artifact '${artifact.name}' couldn't be found, skipping...`);
				}

				continue;
			}
			else {
				throw new Error(pkgResult.from);
			}
		}

		const flowResult = await commonFlow(targetPath, dir, config, options);

		if(!flowResult) {
			continue;
		}

		const { name, version } = flowResult.incomingPackage! as { name: string; version: string };

		for(const artifact of config.artifacts) {
			if(artifact.name === name) {
				artifact.version = version;
				break;
			}
		}

		await writeConfig(config, configStats, flowResult.formats, targetPath, options);
	}
}
