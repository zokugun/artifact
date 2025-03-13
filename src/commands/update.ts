import process from 'process';
import { cyan } from 'ansi-colors';
import npm from 'npm';
import ora from 'ora';
import pacote from 'pacote';
import tempy from 'tempy';
import { readConfig, writeConfig } from '../config';
import { composeSteps, steps } from '../steps';
import { createDevNull } from '../utils/dev-null';

const commonFlow = composeSteps(
	steps.readIncomingPackage,
	steps.validateNewerPackage,
	steps.readIncomingConfig,
	steps.validateUpdatability,
	steps.readFiles,
	steps.readEditorConfig,
	steps.replaceTemplates,
	steps.mergeTextFiles,
	steps.insertFinalNewLine,
	steps.applyFormatting,
	steps.copyBinaryFiles,
	steps.writeTextFiles,
);

export async function update(inputOptions?: { force?: boolean; verbose?: boolean }): Promise<void> {
	// @ts-expect-error log property isn't exposed
	npm.log.stream = createDevNull();

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
		const spinner = ora(`${cyan.bold(artifact.name)}`).start();

		const dir = tempy.directory();
		const pkgResult = await pacote.extract(artifact.name, dir, { registry });

		if(!pkgResult.resolved) {
			if(options.force) {
				spinner.fail();

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
			spinner.succeed();

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

		spinner.succeed();
	}
}
