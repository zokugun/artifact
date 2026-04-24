import process from 'process';
import { c, logger } from '@zokugun/cli-utils';
import { last } from 'lodash-es';
import pacote from 'pacote';
import tempy from 'tempy';
import { readInstallConfig, updateInstallConfig, writeInstallConfig } from '../configs/index.js';
import { composeSteps, steps } from '../steps/index.js';
import { type Request } from '../types/config.js';
import { type Options } from '../types/context.js';

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
		steps.transformUntouchedFiles,
		steps.insertFinalNewLine,
		steps.applyFormatting,
		steps.copyBinaryFiles,
		steps.writeTextFiles,
		steps.removeFiles,
		steps.executeNextBlock,
	],
);

export async function update(inputOptions?: { force?: boolean; verbose?: boolean; dryRun?: boolean }): Promise<void> {
	logger.beginTimer();

	const targetPath = process.cwd();

	const options: Options = {
		dryRun: inputOptions?.dryRun ?? false,
		force: inputOptions?.force ?? false,
		skip: false,
		variables: {},
		verbose: inputOptions?.verbose ?? false,
	};

	const configResult = await readInstallConfig(targetPath);
	if(configResult.fails) {
		logger.fatal(configResult.error);
	}

	const { config, configStats } = configResult.value;

	for(const [name, artifact] of Object.entries(config.artifacts)) {
		const spinner = logger.createSpinner(`${c.cyan.bold(name)}`);
		const dir = tempy.directory();
		const pkgResult = await pacote.extract(name, dir);

		if(!pkgResult.resolved) {
			if(options.force) {
				spinner.fail();

				if(options.verbose) {
					logger.debug(`The artifact '${name}' couldn't be found, skipping...`);
				}

				continue;
			}
			else {
				logger.fatal(pkgResult.from);
			}
		}

		const request: Request = artifact.requires ? { name, variant: last(artifact.requires) } : { name };

		const flowResult = await mainFlow(targetPath, dir, request, config, options);
		if(flowResult.fails) {
			logger.fatal(flowResult.error);
		}

		if(!flowResult.value?.result) {
			spinner.succeed();

			continue;
		}

		updateInstallConfig(config, flowResult.value.result);

		await writeInstallConfig(config, configStats, flowResult.value.formats, targetPath, options);

		spinner.succeed();
	}

	logger.finishTimer();
}
