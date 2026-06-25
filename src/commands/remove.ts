import process from 'node:process';
import { c, logger, enquirer, confirm } from '@zokugun/cli-utils';
import { xtry } from '@zokugun/xtry/async';
import { readInstallConfig, updateUninstallConfig } from '../configs/index.js';
import { resolveAndRunFlow } from '../flow/resolve-and-run-flow.js';
import { validatePresentPackage } from '../flow/validators/validate-present-package.js';
import { composeSteps, steps } from '../steps/index.js';
import { type Options, type Global, OperationType } from '../types/context.js';
import { normalizeRequest } from '../utils/normalize-request.js';
import { toIterator } from '../utils/to-iterator.js';

type CLIOptions = {
	dryRun?: boolean;
	force?: boolean;
	skip?: boolean;
	verbose?: boolean;
};

const commonFlow = composeSteps(
	OperationType.Uninstall,
	steps.configureUninstallFileActions,
	steps.unmergeTextFiles,
	steps.transformUntouchedFiles,
	steps.insertFinalNewLine,
	steps.applyFormatting,
	steps.writeTextFiles,
	steps.removeFiles,
);

export async function remove(specs: string[], inputOptions?: CLIOptions): Promise<void> {
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
		touchedTextFiles: [],
		routes: {},
	};

	const result = await resolveAndRunFlow(toIterator(normalizeRequest, specs), false, false, OperationType.Uninstall, validatePresentPackage, targetPath, commonFlow, updateUninstallConfig, config, global, options);
	if(result.fails) {
		logger.fatal(result.error);
	}

	logger.finishTimer();
}
