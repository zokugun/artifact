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

	const { config, configStats } = await readInstallConfig(targetPath);

	for(const spec of specs) {
		const request = resolveRequest(spec);
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
				throw new Error(pkgResult.from);
			}
		}

		const flowResult = await mainFlow(targetPath, dir, request, config, options);

		if(!flowResult?.result) {
			spinner.succeed();

			continue;
		}

		updateUninstallConfig(config, flowResult.result);

		await writeInstallConfig(config, configStats, flowResult.formats, targetPath, options);

		spinner.succeed();
	}

	logger.finishTimer();
}
