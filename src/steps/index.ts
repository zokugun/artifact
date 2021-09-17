import { Context } from '../types/context';
import { Step } from '../types/step';
import { applyFormatting } from './apply-formatting';
import { copyBinaryFiles } from './copy-binary-files';
import { insertFinalNewLine } from './insert-final-new-line';
import { mergeTextFiles } from './merge-text-files';
import { readEditorConfig } from './read-editor-config';
import { readFiles } from './read-files';
import { readIncomingPackage } from './read-incoming-package';
import { readTargetConfig } from './read-target-config';
import { updateTargetConfig } from './update-target-config';
import { writeTextFiles } from './write-text-files';

export const steps = {
	applyFormatting,
	copyBinaryFiles,
	insertFinalNewLine,
	mergeTextFiles,
	readEditorConfig,
	readFiles,
	readIncomingPackage,
	readTargetConfig,
	updateTargetConfig,
	writeTextFiles,
};

export function composeSteps(...steps: Step[]): (context: Context) => Promise<void> {
	return async (context: Context) => {
		for(const step of steps) {
			await step(context);
		}
	};
}
