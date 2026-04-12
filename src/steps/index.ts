import { c, logger } from '@zokugun/cli-utils';
import { ok, OK_UNDEFINED } from '@zokugun/xtry';
import { type CommonFlow, type Context, type MainFlow } from '../types/context.js';
import { type Step } from '../types/step.js';
import { applyFormatting } from './apply-formatting.js';
import { configureBranches } from './configure-branches.js';
import { configureInstallFileActions } from './configure-install-file-actions.js';
import { configureUninstallFileActions } from './configure-uninstall-file-actions.js';
import { configureUpdateFileActions } from './configure-update-file-actions.js';
import { copyBinaryFiles } from './copy-binary-files.js';
import { executeFirstBlock } from './execute-first-block.js';
import { executeNextBlock } from './execute-next-block.js';
import { insertFinalNewLine } from './insert-final-new-line.js';
import { mergeTextFiles } from './merge-text-files.js';
import { readEditorConfig } from './read-editor-config.js';
import { readFiles } from './read-files.js';
import { readIncomingConfig } from './read-incoming-config.js';
import { readIncomingPackage } from './read-incoming-package.js';
import { removeFiles } from './remove-files.js';
import { renameFiles } from './rename-files.js';
import { replaceTemplates } from './replace-templates.js';
import { validateNewerPackage } from './validate-newer-package.js';
import { validateNotPresentPackage } from './validate-not-present-package.js';
import { validatePresentPackage } from './validate-present-package.js';
import { writeTextFiles } from './write-text-files.js';

export const steps = {
	applyFormatting,
	configureBranches,
	configureInstallFileActions,
	configureUninstallFileActions,
	configureUpdateFileActions,
	copyBinaryFiles,
	executeFirstBlock,
	executeNextBlock,
	insertFinalNewLine,
	mergeTextFiles,
	readEditorConfig,
	readFiles,
	readIncomingConfig,
	readIncomingPackage,
	removeFiles,
	renameFiles,
	replaceTemplates,
	validateNewerPackage,
	validateNotPresentPackage,
	validatePresentPackage,
	writeTextFiles,
};

export function composeSteps(validations: Step[], processes: Step[]): {	mainFlow: MainFlow;	commonFlow: CommonFlow } {
	const mainFlow: MainFlow = async (targetPath, incomingPath, request, config, options) => {
		const context: Context = {
			binaryFiles: [],
			blocks: [],
			commonFlow,
			config,
			filters: () => undefined,
			formats: [],
			incomingPath,
			incomingVariant: request.variant,
			mergedTextFiles: [],
			onExisting: () => 'merge',
			onMissing: () => 'continue',
			options,
			packagePath: incomingPath,
			removedPatterns: [],
			renamedPatterns: [],
			request,
			routes: () => undefined,
			targetPath,
			textFiles: [],
		};

		let skipped = false;

		for(const step of validations) {
			const result = await step(context);
			if(result.fails) {
				return result;
			}

			if(result.value) {
				skipped = true;

				break;
			}
		}

		return skipped ? OK_UNDEFINED : ok(context);
	};

	const commonFlow: CommonFlow = async (name, version, variant, branch, incomingPath, mainContext) => {
		if(mainContext.options.verbose) {
			let message = `${name} version=${version}`;

			if(variant) {
				message += ` variant=${variant}`;
			}

			if(branch) {
				message += ` branch=${branch}`;
			}

			logger.info(c.bgBlue(`\n=== ${message} ===\n`));
		}

		const context: Context = {
			...mainContext,
			incomingPath,
			incomingName: name,
			incomingVersion: version,
			incomingVariant: variant,
			incomingBranch: branch,
			incomingConfig: undefined,
			onExisting: () => 'merge',
			onMissing: () => 'continue',
			filters: () => undefined,
			routes: () => undefined,
			binaryFiles: [],
			textFiles: [],
			mergedTextFiles: [],
			formats: [],
		};

		let skipped = false;

		for(const step of processes) {
			const result = await step(context);
			if(result.fails) {
				return result;
			}

			if(result.value) {
				skipped = true;

				break;
			}
		}

		return skipped ? OK_UNDEFINED : ok(context);
	};

	return { mainFlow, commonFlow };
}
