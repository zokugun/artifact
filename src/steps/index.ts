import { c, logger } from '@zokugun/cli-utils';
import fse from '@zokugun/fs-extra-plus/async';
import { err, ok, OK_UNDEFINED } from '@zokugun/xtry';
import { type OperationType, type CommonFlow, type Context } from '../types/context.js';
import { type Step } from '../types/step.js';
import { applyFormatting } from './apply-formatting.js';
import { applyPatchFiles } from './apply-patch-files.js';
import { configureInstallFileActions } from './configure-install-file-actions.js';
import { configureUninstallFileActions } from './configure-uninstall-file-actions.js';
import { configureUpdateFileActions } from './configure-update-file-actions.js';
import { copyBinaryFiles } from './copy-binary-files.js';
import { insertFinalNewLine } from './insert-final-new-line.js';
import { mergeTextFiles } from './merge-text-files.js';
import { readEditorConfig } from './read-editor-config.js';
import { readFiles } from './read-files.js';
import { removeFiles } from './remove-files.js';
import { renameFiles } from './rename-files.js';
import { replaceTemplates } from './replace-templates.js';
import { transformUntouchedFiles } from './transform-untouched-files.js';
import { unmergeTextFiles } from './unmerge-text-files.js';
import { writeTextFiles } from './write-text-files.js';

export const steps = {
	applyFormatting,
	applyPatchFiles,
	configureInstallFileActions,
	configureUninstallFileActions,
	configureUpdateFileActions,
	copyBinaryFiles,
	insertFinalNewLine,
	mergeTextFiles,
	readEditorConfig,
	readFiles,
	removeFiles,
	renameFiles,
	replaceTemplates,
	transformUntouchedFiles,
	unmergeTextFiles,
	writeTextFiles,
};

export function composeSteps(operationType: OperationType, ...processes: Step[]): CommonFlow {
	return async (targetPath, incoming, incomingPath, label, operationMode, result, config, global, options) => {
		if(options.verbose) {
			logger.print(c.bgBlue(`\n=== ${label} ===\n`));
		}

		if(!incomingPath) {
			if(!incoming) {
				return err('No path provided to compose steps');
			}

			incomingPath = fse.join(incoming.dir, 'configs');
		}

		const context: Context = {
			binaryFiles: [],
			config,
			filters: () => undefined,
			formats: [],
			global,
			incomingPath,
			incomingConfig: incoming?.config,
			incomingName: incoming?.name,
			incomingVersion: incoming?.version,
			incomingVariant: incoming?.variant,
			incomingBranch: incoming?.branch,
			mergedTextFiles: [],
			onExisting: () => 'merge',
			onMissing: () => 'continue',
			operationMode,
			operationType,
			options,
			patchFiles: [],
			removedPatterns: [],
			renamedPatterns: [],
			result,
			routes: () => undefined,
			targetPath,
			textFiles: [],
			transformedFiles: [],
			transforms: () => undefined,
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
}
