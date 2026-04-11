import c from 'ansi-colors';
import { type CommonFlow, type Context, type MainFlow } from '../types/context.js';
import { type Step } from '../types/step.js';
import { applyFormatting } from './apply-formatting.js';
import { configureBranches } from './configure-branches.js';
import { configureInstallFileActions } from './configure-install-file-actions.js';
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
import { replaceTemplates } from './replace-templates.js';
import { validateNewerPackage } from './validate-newer-package.js';
import { validateNotPresentPackage } from './validate-not-present-package.js';
import { writeTextFiles } from './write-text-files.js';

export const steps = {
	applyFormatting,
	configureBranches,
	configureInstallFileActions,
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
	replaceTemplates,
	validateNewerPackage,
	validateNotPresentPackage,
	writeTextFiles,
};

export function composeSteps(validations: Step[], processes: Step[]): {	mainFlow: MainFlow;	commonFlow: CommonFlow } {
	const mainFlow: MainFlow = async (targetPath, incomingPath, request, config, options) => {
		const context: Context = {
			packagePath: incomingPath,
			request,
			targetPath,
			incomingPath,
			incomingVariant: request.variant,
			onExisting: () => 'merge',
			onMissing: () => 'continue',
			filters: () => undefined,
			routes: () => undefined,
			binaryFiles: [],
			textFiles: [],
			mergedTextFiles: [],
			removedPatterns: [],
			formats: [],
			config,
			options,
			commonFlow,
			blocks: [],
		};

		let skipped = false;

		for(const step of validations) {
			if(await step(context)) {
				skipped = true;

				break;
			}
		}

		return skipped ? undefined : context;
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

			console.log(c.bgBlue(`\n=== ${message} ===\n`));
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
			if(await step(context)) {
				skipped = true;

				break;
			}
		}

		return skipped ? undefined : context;
	};

	return { mainFlow, commonFlow };
}
