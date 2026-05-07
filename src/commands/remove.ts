import process from 'process';
import { c, logger, enquirer, confirm } from '@zokugun/cli-utils';
import { xtry } from '@zokugun/xtry/async';
import { readInstallConfig, updateUninstallConfig, writeInstallConfig } from '../configs/index.js';
import { composeSteps, steps } from '../steps/index.js';
import { type Options, type Global } from '../types/context.js';
import { loadPackage } from '../utils/load-package.js';
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

	const options: Options = {
		dryRun: inputOptions?.dryRun ?? false,
		force: inputOptions?.force ?? false,
		skip: inputOptions?.skip ?? false,
		variables: {},
		verbose: inputOptions?.verbose ?? false,
	};

	const configResult = await readInstallConfig(targetPath);
	if(configResult.fails) {
		logger.fatal(configResult.error);
	}

	const config = configResult.value;

	if(specs.length === 0) {
		const { value } = await xtry(enquirer.prompt<{ specs: string[] }>({
			type: 'multiselect',
			name: 'specs',
			message: 'Pick the artifacts to remove',
			choices: Object.keys(config.artifacts).map((name) => ({ name })),
		}));

		const marked = value?.specs;

		if(!marked || marked.length === 0) {
			logger.warn('No artifacts marked for removal');
		}
		else {
			const { value } = await xtry(enquirer.prompt<{ remove: boolean }>(
				[
					confirm({
						name: 'remove',
						message: `Remove the following artifacts: ${marked.map((name) => c.green(name)).join(',')}`,
					}),
				],
			));

			if(value?.remove) {
				specs.push(...marked);
			}
			else {
				logger.warn('Artifacts removal has been rejected');
			}
		}
	}

	const global: Global = {
		journeys: {},
		overwrittenTextFiles: [],
		routes: {},
	};

	for(const spec of specs) {
		const requestResult = resolveRequest(spec);
		if(requestResult.fails) {
			logger.fatal(requestResult.error);
		}

		const request = requestResult.value;
		const spinner = logger.createSpinner(`${c.cyan.bold(request.name)}`);
		const dir = await loadPackage(request.name, spinner, options);

		if(!dir) {
			continue;
		}

		const flowResult = await mainFlow(targetPath, dir, request, config, global, options);
		if(flowResult.fails) {
			logger.fatal(flowResult.error);
		}

		if(!flowResult.value?.result) {
			spinner.succeed();

			continue;
		}

		updateUninstallConfig(config, flowResult.value.result);

		await writeInstallConfig(config, flowResult.value.formats, targetPath, options);

		spinner.succeed();
	}

	logger.finishTimer();
}
