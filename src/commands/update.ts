import process from 'node:process';
import { c, logger } from '@zokugun/cli-utils';
import { readInstallConfig, readPackageConfig, updateInstallConfig, writeInstallConfig } from '../configs/index.js';
import { composeSteps, steps } from '../steps/index.js';
import { type Request } from '../types/config.js';
import { type Options, type Global, OperationType } from '../types/context.js';
import { loadPackage } from '../utils/load-package.js';

type CLIOptions = {
	dryRun?: boolean;
	force?: boolean;
	minReleaseAge?: number;
	verbose?: boolean;
};

const { mainFlow } = composeSteps(
	OperationType.Update,
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

export async function update(inputOptions: CLIOptions = {}): Promise<void> {
	logger.beginTimer();

	const targetPath = process.cwd();

	const options: Options = {
		dryRun: inputOptions.dryRun ?? false,
		force: inputOptions.force ?? false,
		skip: false,
		variables: {},
		verbose: inputOptions.verbose ?? false,
	};

	const minAgeHours = inputOptions.minReleaseAge ?? 24;

	logger.newLine();
	logger.info(`min-release-age: ${minAgeHours}h`);
	logger.newLine();

	const before = new Date(Date.now() - (minAgeHours * 3_600_000));

	const configResult = await readInstallConfig(targetPath);
	if(configResult.fails) {
		logger.fatal(configResult.error);
	}

	const config = configResult.value;

	const global: Global = {
		journeys: {},
		overwrittenTextFiles: [],
		routes: {},
	};

	for(const [name, artifact] of Object.entries(config.artifacts)) {
		const spinner = logger.createSpinner(`${c.cyan.bold(name)}`);
		const request: Request = artifact.requires ? { name, variant: artifact.requires.at(-1) } : { name };
		const dir = await loadPackage(request.name, spinner, { ...options, before });

		if(!dir) {
			continue;
		}

		const result = await mainFlow(targetPath, dir, request, config, global, options);
		if(result.fails) {
			logger.fatal(result.error);
		}

		const context = result.value;

		if(context?.incomingConfig) {
			for(const { name, plan, scope } of context.incomingConfig.journeys) {
				if(scope === 'global') {
					global.journeys[name] = plan;
				}
			}

			for(const [name, route] of Object.entries(context.incomingConfig.routes)) {
				if(route.scope === 'global') {
					global.routes[name] = route;
				}
			}
		}
		else {
			const result = await readPackageConfig(dir, global.routes, OperationType.Update);
			if(result.fails) {
				logger.fatal(result.error);
			}

			for(const { name, plan, scope } of result.value.journeys) {
				if(scope === 'global') {
					global.journeys[name] = plan;
				}
			}

			for(const [name, spec] of Object.entries(result.value.routes)) {
				if(spec.scope === 'global') {
					global.routes[name] = spec;
				}
			}
		}

		if(!context?.result) {
			spinner.succeed();

			continue;
		}

		updateInstallConfig(config, context.result);

		await writeInstallConfig(config, context.formats, targetPath, options);

		spinner.succeed();
	}

	logger.finishTimer();
}
