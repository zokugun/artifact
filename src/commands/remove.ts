import process from 'process';
import { c, logger } from '@zokugun/cli-utils';
import pacote from 'pacote';
import tempy from 'tempy';
import { readInstallConfig, updateUninstallConfig, writeInstallConfig } from '../configs/index.js';
import { composeSteps, steps } from '../steps/index.js';
import { resolveRequest } from '../utils/resolve-request.js';

const { mainFlow } = composeSteps(
	[
		steps.readIncomingPackage,
		steps.validatePresentPackage,
		steps.readIncomingConfig,
		steps.executeFirstBlock,
	],
	[
		steps.readIncomingConfig,
		steps.configureBranches,
		steps.configureUninstallFileActions,
		steps.unmergeTextFiles,
		steps.transformUntouchedFiles,
		steps.insertFinalNewLine,
		steps.applyFormatting,
		steps.writeTextFiles,
		steps.removeFiles,
		steps.executeNextBlock,
	],
);

export async function remove(specs: string[], inputOptions?: { force?: boolean; skip?: boolean; verbose?: boolean; dryRun?: boolean }): Promise<void> {
	logger.beginTimer();

	const targetPath = process.cwd();

	const options = {
		force: inputOptions?.force ?? false,
		skip: inputOptions?.skip ?? false,
		verbose: inputOptions?.verbose ?? false,
		dryRun: inputOptions?.dryRun ?? false,
	};

	const configResult = await readInstallConfig(targetPath);
	if(configResult.fails) {
		logger.fatal(configResult.error);
	}

	const { config, configStats } = configResult.value;

	for(const spec of specs) {
		const requestResult = resolveRequest(spec);
		if(requestResult.fails) {
			logger.fatal(requestResult.error);
		}

		const request = requestResult.value;
		const spinner = logger.createSpinner(`${c.cyan.bold(request.name)}`);
		const dir = tempy.directory();
		const pkgResult = await pacote.extract(request.name, dir);

		if(!pkgResult.resolved) {
			if(options.force || options.skip) {
				spinner.fail();

				if(options.verbose) {
					logger.debug(`The artifact '${spec}' couldn't be found, skipping...`);
				}

				continue;
			}
			else {
				logger.fatal(pkgResult.from);
			}
		}

		const flowResult = await mainFlow(targetPath, dir, request, config, options);
		if(flowResult.fails) {
			logger.fatal(flowResult.error);
		}

		if(!flowResult.value?.result) {
			spinner.succeed();

			continue;
		}

		updateUninstallConfig(config, flowResult.value.result);

		await writeInstallConfig(config, configStats, flowResult.value.formats, targetPath, options);

		spinner.succeed();
	}

	logger.finishTimer();
}
