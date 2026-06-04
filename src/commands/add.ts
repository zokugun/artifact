import process from 'node:process';
import { logger, c, enquirer, confirm } from '@zokugun/cli-utils';
import fse from '@zokugun/fs-extra-plus/async';
import { xtry } from '@zokugun/xtry/async';
import pacote from 'pacote';
import { readInstallConfig, readPackageConfig, updateInstallConfig, writeInstallConfig } from '../configs/index.js';
import { readListingConfig } from '../configs/package/read-listing-config.js';
import { composeSteps, steps } from '../steps/index.js';
import { type Request } from '../types/config.js';
import { type Options, type Global, OperationType } from '../types/context.js';
import { loadPackage } from '../utils/load-package.js';
import { resolveRequest } from '../utils/resolve-request.js';

const { mainFlow } = composeSteps(
	OperationType.Install,
	[
		steps.readIncomingPackage,
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
	minReleaseAge?: number;
	skip?: boolean;
	var?: Array<{ name: string; value: string }>;
	verbose?: boolean;
};

export async function add(specs: string[], inputOptions: CLIOptions = {}): Promise<void> {
	logger.beginTimer();

	if(specs.length === 1 && /^@\w+$/.test(specs[0])) {
		const request = `${specs.shift()}/artifact-listing`;
		const spinner = logger.createSpinner(`${c.cyan.bold(request)}`);

		const dir = await fse.makeTempDir();
		if(dir.fails) {
			logger.fatal('Cannot generate temporary directory');
		}

		const pkgResult = await xtry(pacote.extract(request, dir.value));

		if(pkgResult.fails) {
			logger.fatal(`The artifact '${request}' couldn't be found.`);
		}

		spinner.succeed();

		logger.stopProgress();

		const listing = await readListingConfig(dir.value);
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

			// eslint-disable-next-line unicorn/no-process-exit
			process.exit(0);
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

	const targetPath = process.cwd();

	const options: Options = {
		dryRun: inputOptions.dryRun ?? false,
		force: inputOptions.force ?? false,
		skip: inputOptions.skip ?? false,
		variables: {},
		verbose: inputOptions.verbose ?? false,
	};

	if(inputOptions.var) {
		for(const { name, value } of inputOptions.var) {
			options.variables[name] = value;
		}
	}

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

	const requests: Request[] = [];

	for(const spec of specs) {
		const request = resolveRequest(spec);
		if(request.fails) {
			logger.fatal(request.error);
		}

		if(!options.force) {
			const { name } = request.value;
			const artifact = config.artifacts[name];

			if(artifact) {
				if(options.skip) {
					if(options.verbose) {
						logger.debug(`The "${name}" artifact is already present, skipping...`);
					}
				}
				else {
					logger.fatal(`The "${name}" artifact has already been added.`);
				}
			}
		}

		requests.push(request.value);
	}

	const global: Global = {
		journeys: {},
		overwrittenTextFiles: [],
		routes: {},
	};

	for(const [name, { version }] of Object.entries(config.artifacts)) {
		const spinner = logger.createSpinner(`${c.cyan.bold(name)}`);
		const dir = await loadPackage(`${name}@${version}`, spinner, { ...options, before });

		if(!dir) {
			continue;
		}

		const result = await readPackageConfig(dir, global.routes, OperationType.Install);
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

		spinner.succeed();
	}

	for(const request of requests) {
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

		updateInstallConfig(config, flowResult.value.result);

		await writeInstallConfig(config, flowResult.value.formats, targetPath, options);

		spinner.succeed();
	}

	logger.finishTimer();
}
