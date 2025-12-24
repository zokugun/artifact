import process from 'process';
import { cyan } from 'ansi-colors';
import npm from 'npm';
import ora from 'ora';
import pacote from 'pacote';
import tempy from 'tempy';
import { readInstallConfig, updateInstallConfig, writeInstallConfig } from '../configs';
import { composeSteps, steps } from '../steps';
import { resolveRequest } from '../utils/resolve-request';

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

export async function add(specs: string[], inputOptions?: { force?: boolean; skip?: boolean; verbose?: boolean; dryRun?: boolean }): Promise<void> {
	await npm.load();

	const registry = npm.config.get('registry') as string;
	const targetPath = process.env.INIT_CWD!;

	const options = {
		force: inputOptions?.force ?? false,
		skip: inputOptions?.skip ?? false,
		verbose: inputOptions?.verbose ?? false,
		dryRun: inputOptions?.dryRun ?? false,
	};

	const { config, configStats } = await readInstallConfig(targetPath);

	for(const spec of specs) {
		const request = resolveRequest(spec);
		const spinner = ora(`${cyan.bold(request.name)}`).start();

		const dir = tempy.directory();
		const pkgResult = await pacote.extract(request.name, dir, { registry });

		if(!pkgResult.resolved) {
			if(options.force || options.skip) {
				spinner.fail();

				if(options.verbose) {
					console.log(`The artifact '${spec}' couldn't be found, skipping...`);
				}

				continue;
			}
			else {
				throw new Error(pkgResult.from);
			}
		}

		const flowResult = await mainFlow(targetPath, dir, request, config, options);

		if(!flowResult || !flowResult.result) {
			spinner.succeed();

			continue;
		}

		updateInstallConfig(config, flowResult.result);

		await writeInstallConfig(config, configStats, flowResult.formats, targetPath, options);

		spinner.succeed();
	}
}
