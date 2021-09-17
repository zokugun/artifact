import { composeSteps, steps } from './steps';

const commonFlow = composeSteps(
	steps.readTargetConfig,
	steps.readIncomingPackage,
	steps.readFiles,
	steps.readEditorConfig,
	steps.mergeTextFiles,
	steps.updateTargetConfig,
	steps.insertFinalNewLine,
	steps.applyFormatting,
	steps.copyBinaryFiles,
	steps.writeTextFiles,
);

export async function install(targetPath: string, incomingPath: string, options?: { verbose: boolean }): Promise<void> {
	await commonFlow({
		targetPath,
		incomingPath,
		binaryFiles: [],
		textFiles: [],
		mergedTextFiles: [],
		configs: [],
		formats: [],
		options: {
			verbose: options?.verbose ?? false,
		},
	});
}
