import process from 'node:process';
import { logger, c, enquirer, confirm } from '@zokugun/cli-utils';
import { xtry } from '@zokugun/xtry/async';
import pacote from 'pacote';
import tempy from 'tempy';
import { readInstallConfig, updateInstallConfig, writeInstallConfig } from '../configs/index.js';
import { readListingConfig } from '../configs/package/read-listing-config.js';
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

	if(specs.length === 1 && /^@\w+$/.test(specs[0])) {
		const request = `${specs.shift()}/artifact-listing`;
		const spinner = logger.createSpinner(`${c.cyan.bold(request)}`);
		const dir = tempy.directory();
		const pkgResult = await xtry(pacote.extract(request, dir));

		if(pkgResult.fails) {
			logger.fatal(`The artifact '${request}' couldn't be found.`);
		}

		spinner.succeed();

		logger.stopProgress();

		const listing = await readListingConfig(dir);
		if(listing.fails) {
			logger.fatal(listing.error);
		}

		const { value } = await xtry(enquirer.prompt<{ specs: string[] }>({
			type: 'multiselect',
			name: 'specs',
			message: 'Pick the artifacts to add',
			// @ts-expect-error TS2353
			limit: 7,
			choices: listing.value.map(({ name, description }) => ({ name, message: `${name}${c.grey(`: ${description}`)}` })),
		}));

		const marked = value?.specs;

		if(!marked || marked.length === 0) {
			logger.warn('No artifacts marked for addition');
		}
		else {
			const { value } = await xtry(enquirer.prompt<{ addition: boolean }>(
				[
					confirm({
						name: 'addition',
						message: `Adds the following artifacts: ${marked.map((name) => c.green(name)).join(',')}`,
					}),
				],
			));

			if(value?.addition) {
				specs.push(...marked);
			}
			else {
				logger.warn('Artifacts addition has been rejected');
			}
		}
	}

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
