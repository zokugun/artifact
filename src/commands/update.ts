import process from 'node:process';
import { logger } from '@zokugun/cli-utils';
import { type DResult, ok } from '@zokugun/xtry';
import { readInstallConfig, updateInstallConfig } from '../configs/index.js';
import { resolveAndRunFlow } from '../flow/resolve-and-run-flow.js';
import { validateNewerPackage } from '../flow/validators/validate-newer-package.js';
import { composeSteps, steps } from '../steps/index.js';
import { type InstallConfig, type Request } from '../types/config.js';
import { type Options, OperationType, type Global } from '../types/context.js';

type CLIOptions = {
	dryRun?: boolean;
	force?: boolean;
	minReleaseAge?: number;
	verbose?: boolean;
};

const commonFlow = composeSteps(
	OperationType.Update,
	steps.configureUpdateFileActions,
	steps.renameFiles,
	steps.readFiles,
	steps.readEditorConfig,
	steps.replaceTemplates,
	steps.mergeTextFiles,
	steps.applyPatchFiles,
	steps.transformUntouchedFiles,
	steps.insertFinalNewLine,
	steps.applyFormatting,
	steps.copyBinaryFiles,
	steps.writeTextFiles,
	steps.removeFiles,
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

	const configResult = await readInstallConfig(targetPath);
	if(configResult.fails) {
		logger.fatal(configResult.error);
	}

	const config = configResult.value;

	const global: Global = {
		before: new Date(Date.now() - (minAgeHours * 3_600_000)),
		journeys: {},
		overwrittenTextFiles: [],
		routes: {},
	};

	const result = await resolveAndRunFlow(requestsIterator(config), true, false, OperationType.Update, validateNewerPackage, targetPath, commonFlow, updateInstallConfig, config, global, options);
	if(result.fails) {
		logger.fatal(result.error);
	}

	logger.finishTimer();
}

function * requestsIterator(config: InstallConfig): Generator<DResult<Request>> {
	for(const [name, artifact] of Object.entries(config.artifacts)) {
		if(artifact.requires) {
			for(const variant of artifact.requires) {
				yield ok({ name, variant });
			}
		}
		else {
			yield ok({ name });
		}
	}
}
