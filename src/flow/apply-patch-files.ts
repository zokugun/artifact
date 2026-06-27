import fse from '@zokugun/fs-extra-plus/async';
import { type AsyncDResult, OK } from '@zokugun/xtry';
import { steps } from '../steps/index.js';
import { type InstallConfig } from '../types/config.js';
import { type Context, OperationMode, type OperationType, type Options, type PatchFile, type TextFile, type Global } from '../types/context.js';
import { IndentStyle } from '../types/format.js';
import { readTextFile } from '../utils/read-text-file.js';
import { applyJsonPatch } from './utils/apply-json-patch.js';
import { applyUnidiffPatch } from './utils/apply-unidiff-patch.js';
import { mergeAndApplyUnidiff } from './utils/merge-and-apply-unidiff.js';

export async function applyPatchFiles(patchesMap: Record<string, PatchFile[]>, targetPath: string, operationType: OperationType, config: InstallConfig, global: Global, options: Options): AsyncDResult {
	const mergedTextFiles: TextFile[] = [];

	for(const [name, patches] of Object.entries(patchesMap)) {
		const readResult = await readTextFile(name, fse.join(targetPath, name), options);
		if(readResult.fails) {
			return readResult;
		}

		const textFile = readResult.value;

		mergedTextFiles.push(textFile);

		if(patches.length === 1) {
			const { file, type } = patches[0];
			const apply = type === 'json-patch' ? applyJsonPatch : applyUnidiffPatch;

			const result = apply(textFile.data, file.data);
			if(result.fails) {
				return result;
			}

			updateData(result.value, textFile, mergedTextFiles);
		}
		else {
			const unidiffs: string[] = [];

			for(const patch of patches) {
				if(patch.type === 'json-patch') {
					if(unidiffs.length > 0) {
						const result = mergeAndApplyUnidiff(textFile.data, unidiffs);
						if(result.fails) {
							return result;
						}

						updateData(result.value, textFile, mergedTextFiles);

						unidiffs.length = 0;
					}

					const result = applyJsonPatch(textFile.data, patch.file.data);
					if(result.fails) {
						return result;
					}

					updateData(result.value, textFile, mergedTextFiles);
				}
				else {
					unidiffs.push(patch.file.data);
				}
			}

			if(unidiffs.length > 0) {
				const result = mergeAndApplyUnidiff(textFile.data, unidiffs);
				if(result.fails) {
					return result;
				}

				updateData(result.value, textFile, mergedTextFiles);
			}
		}
	}

	const context: Context = {
		binaryFiles: [],
		config,
		filters: () => undefined,
		formats: [],
		global,
		incomingPath: '',
		mergedTextFiles,
		onExisting: () => 'merge',
		onMissing: () => 'continue',
		operationMode: OperationMode.Default,
		operationType,
		options,
		removedPatterns: [],
		renamedPatterns: [],
		routes: () => undefined,
		targetPath,
		textFiles: [],
		transformedFiles: [],
		transforms: () => undefined,
	};

	for(const step of [steps.insertFinalNewLine, steps.applyFormatting, steps.writeTextFiles]) {
		const result = await step(context);
		if(result.fails) {
			return result;
		}
	}

	return OK;
}

function updateData(result: { output: string; reject: string }, textFile: TextFile, mergedTextFiles: TextFile[]): void {
	textFile.data = result.output;

	if(result.reject.length > 0) {
		mergedTextFiles.push({
			data: result.reject,
			finalNewLine: true,
			indent: {
				size: 2,
				style: IndentStyle.SPACE,
			},
			name: `${textFile.name}.rej`,
		});
	}
}
