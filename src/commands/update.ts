import process from 'process';
import { cyan } from 'ansi-colors';
import { last } from 'lodash';
import npm from 'npm';
import ora from 'ora';
import pacote from 'pacote';
import tempy from 'tempy';
import { readInstallConfig, updateInstallConfig, writeInstallConfig } from '../configs';
import { composeSteps, steps } from '../steps';
import { Request } from '../types/config';
import { createDevNull } from '../utils/dev-null';

const { mainFlow } = composeSteps(
	[
		steps.readIncomingPackage,
		steps.validateNewerPackage,
		steps.readIncomingConfig,
		steps.executeFirstBlock,
	],
	[
		steps.readIncomingConfig,
		steps.configureBranches,
		steps.configureUpdateFileActions,
		steps.readFiles,
		steps.readEditorConfig,
		steps.replaceTemplates,
		steps.mergeTextFiles,
		steps.insertFinalNewLine,
		steps.applyFormatting,
		steps.copyBinaryFiles,
		steps.writeTextFiles,
		steps.removeFiles,
		steps.executeNextBlock,
	],
);

export async function update(inputOptions?: { force?: boolean; verbose?: boolean; dryRun?: boolean }): Promise<void> {
	// @ts-expect-error log property isn't exposed
	npm.log.stream = createDevNull();

	await npm.load();

	const registry = npm.config.get('registry') as string;
	const targetPath = process.env.INIT_CWD!;

	const options = {
		force: inputOptions?.force ?? false,
		skip: false,
		verbose: inputOptions?.verbose ?? false,
		dryRun: inputOptions?.dryRun ?? false,
	};

	const { config, configStats } = await readInstallConfig(targetPath);

	for(const [name, artifact] of Object.entries(config.artifacts)) {
		const spinner = ora(`${cyan.bold(name)}`).start();

		const dir = tempy.directory();
		const pkgResult = await pacote.extract(name, dir, { registry });

		if(!pkgResult.resolved) {
			if(options.force) {
				spinner.fail();

				if(options.verbose) {
					console.log(`The artifact '${name}' couldn't be found, skipping...`);
				}

				continue;
			}
			else {
				throw new Error(pkgResult.from);
			}
		}

		const request: Request = artifact.requires ? { name, variant: last(artifact.requires) } : { name };

		const flowResult = await mainFlow(targetPath, dir, request, config, options);

		if(!flowResult || !flowResult.result) {
			spinner.succeed();

			continue;
		}

		updateInstallConfig(config, flowResult.result);

		await writeInstallConfig(config, configStats, flowResult.formats, targetPath, options);

		spinner.succeed();
	}
}
