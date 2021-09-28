import { Config } from '../types/config';
import { Context, Options } from '../types/context';
import { Step } from '../types/step';
import { applyFormatting } from './apply-formatting';
import { copyBinaryFiles } from './copy-binary-files';
import { insertFinalNewLine } from './insert-final-new-line';
import { mergeTextFiles } from './merge-text-files';
import { readEditorConfig } from './read-editor-config';
import { readFiles } from './read-files';
import { readIncomingConfig } from './read-incoming-config';
import { readIncomingPackage } from './read-incoming-package';
import { validateNewerPackage } from './validate-newer-package';
import { validateNotPresentPackage } from './validate-not-present-package';
import { validateUpdatability } from './validate-updatability';
import { writeTextFiles } from './write-text-files';

export const steps = {
	applyFormatting,
	copyBinaryFiles,
	insertFinalNewLine,
	mergeTextFiles,
	readEditorConfig,
	readFiles,
	readIncomingConfig,
	readIncomingPackage,
	validateNewerPackage,
	validateNotPresentPackage,
	validateUpdatability,
	writeTextFiles,
};

export function composeSteps(...steps: Step[]): (targetPath: string, incomingPath: string, config: Config, options: Options) => Promise<Context | undefined> {
	return async (targetPath, incomingPath, config, options) => {
		const context = {
			targetPath,
			incomingPath,
			onMissing: () => false,
			onUpdate: () => false,
			filters: () => undefined,
			routes: () => undefined,
			binaryFiles: [],
			textFiles: [],
			mergedTextFiles: [],
			formats: [],
			config,
			options,
		};

		let skipped = false;

		for(const step of steps) {
			if(await step(context)) {
				skipped = true;

				break;
			}
		}

		return skipped ? undefined : context;
	};
}
