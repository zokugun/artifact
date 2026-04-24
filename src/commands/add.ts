import process from 'process';
import { logger, c } from '@zokugun/cli-utils';
import pacote from 'pacote';
import tempy from 'tempy';
import { readInstallConfig, updateInstallConfig, writeInstallConfig } from '../configs/index.js';
import { composeSteps, steps } from '../steps/index.js';
import { type Options } from '../types/context.js';
import { resolveRequest } from '../utils/resolve-request.js';

const { mainFlow } = composeSteps(
	[
		steps.readIncomingPackage,
		steps.validateNotPresentPackage,
		steps.readIncomingConfig,
		steps.executeFirstBlock,
	],
	[
		steps.readIncomingConfig,
		steps.configureBranches,
		steps.configureInstallFileActions,
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

type CLIOptions = {
	dryRun?: boolean;
	force?: boolean;
	skip?: boolean;
	var?: Array<{ name: string; value: string }>;
	verbose?: boolean;
};

export async function add(specs: string[], inputOptions?: CLIOptions): Promise<void> {
	logger.beginTimer();

	const targetPath = process.cwd();

	const options: Options = {
		dryRun: inputOptions?.dryRun ?? false,
		force: inputOptions?.force ?? false,
		skip: inputOptions?.skip ?? false,
		variables: {},
		verbose: inputOptions?.verbose ?? false,
	};

	if(inputOptions?.var) {
		for(const { name, value } of inputOptions.var) {
			options.variables[name] = value;
		}
	}

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
					logger.warn(`The artifact '${spec}' couldn't be found, skipping...`);
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

		updateInstallConfig(config, flowResult.value.result);

		await writeInstallConfig(config, configStats, flowResult.value.formats, targetPath, options);

		spinner.succeed();
	}

	logger.finishTimer();
}
