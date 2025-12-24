import { CommonFlow, Context, MainFlow } from '../types/context';
import { Step } from '../types/step';
import { applyFormatting } from './apply-formatting';
import { configureBranches } from './configure-branches';
import { configureInstallFileActions } from './configure-install-file-actions';
import { configureUpdateFileActions } from './configure-update-file-actions';
import { copyBinaryFiles } from './copy-binary-files';
import { executeFirstBlock } from './execute-first-block';
import { executeNextBlock } from './execute-next-block';
import { insertFinalNewLine } from './insert-final-new-line';
import { mergeTextFiles } from './merge-text-files';
import { readEditorConfig } from './read-editor-config';
import { readFiles } from './read-files';
import { readIncomingConfig } from './read-incoming-config';
import { readIncomingPackage } from './read-incoming-package';
import { removeFiles } from './remove-files';
import { replaceTemplates } from './replace-templates';
import { validateNewerPackage } from './validate-newer-package';
import { validateNotPresentPackage } from './validate-not-present-package';
import { writeTextFiles } from './write-text-files';

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
			let message = `--> ${name}@${version}`;

			if(variant) {
				message += `:${variant}`;
			}

			if(branch) {
				message += `(${branch})`;
			}

			console.log(message);
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
