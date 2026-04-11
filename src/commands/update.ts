import process from 'process';
import c from 'ansi-colors';
import { last } from 'lodash-es';
import ora from 'ora';
import pacote from 'pacote';
import tempy from 'tempy';
import { readInstallConfig, updateInstallConfig, writeInstallConfig } from '../configs/index.js';
import { composeSteps, steps } from '../steps/index.js';
import { type Request } from '../types/config.js';

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
		steps.renameFiles,
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
	const targetPath = process.cwd();

	const options = {
		force: inputOptions?.force ?? false,
		skip: false,
		verbose: inputOptions?.verbose ?? false,
		dryRun: inputOptions?.dryRun ?? false,
	};

	const { config, configStats } = await readInstallConfig(targetPath);

	for(const [name, artifact] of Object.entries(config.artifacts)) {
		const spinner = ora(`${c.cyan.bold(name)}`).start();

		const dir = tempy.directory();
		const pkgResult = await pacote.extract(name, dir);

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

		if(!flowResult?.result) {
			spinner.succeed();

			continue;
		}

		updateInstallConfig(config, flowResult.result);

		await writeInstallConfig(config, configStats, flowResult.formats, targetPath, options);

		spinner.succeed();
	}
}
