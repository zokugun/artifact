import { composeSteps, steps } from './steps';

const commonFlow = composeSteps(
	steps.readTargetConfig,
	steps.readIncomingPackage,
	steps.readFiles,
	steps.readEditorConfig,
	steps.mergeTextFiles,
	steps.writeTargetConfig,
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
		config: {
			artifacts: [],
		},
		formats: [],
		options: {
			verbose: options?.verbose ?? false,
		},
	});
}
