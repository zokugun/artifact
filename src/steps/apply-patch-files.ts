import fse from '@zokugun/fs-extra-plus/async';
import { applyUnidiff } from '@zokugun/unidiff-strict';
import { type AsyncDResult, type DResult, err, ok, OK, stringifyError, xtry } from '@zokugun/xtry/sync';
import { patch } from 'ultrapatch';
import { JSON, JSONC } from '../parsers/index.js';
import { type Transform } from '../parsers/jsonc/transform.js';
import { type Context, type TextFile } from '../types/context.js';
import { IndentStyle } from '../types/format.js';
import { readTextFile } from '../utils/read-text-file.js';

export async function applyPatchFiles({ incomingPath, mergedTextFiles, patchFiles, targetPath, options }: Context): AsyncDResult {
	const configPath = fse.join(incomingPath, 'configs');

	for(const { name, patchName, type } of patchFiles) {
		const patchPath = fse.join(configPath, patchName);
		let matched = false;
		let reject = '';

		for(const [index, mergedFile] of mergedTextFiles.entries()) {
			if(mergedFile.name === name) {
				const result = await applyPatchFile(mergedFile, patchPath, type);
				if(result.fails) {
					return result;
				}

				matched = true;
				reject = result.value.reject;

				mergedTextFiles[index] = {
					...mergedTextFiles[index],
					data: result.value.output,
				};

				break;
			}
		}

		if(!matched) {
			const filePath = fse.join(targetPath, name);

			if(await fse.isFile(filePath)) {
				const textFile = await readTextFile(name, filePath, options);
				if(textFile.fails) {
					return textFile;
				}

				const result = await applyPatchFile(textFile.value, patchPath, type);
				if(result.fails) {
					return result;
				}

				mergedTextFiles.push({
					...textFile.value,
					data: result.value.output,
				});

				reject = result.value.reject;
			}
		}

		if(reject.length > 0) {
			mergedTextFiles.push({
				data: reject,
				finalNewLine: true,
				indent: {
					size: 2,
					style: IndentStyle.SPACE,
				},
				name: `${name}.rej`,
			});
		}
	}

	return OK;
}

async function applyPatchFile(textFile: TextFile, patchPath: string, type: 'json-patch' | 'patch'): AsyncDResult<{ output: string; reject: string }> {
	const patchContent = await fse.readFile(patchPath, 'utf8');
	if(patchContent.fails) {
		return err(stringifyError(patchContent.error));
	}

	if(type === 'json-patch') {
		const input = toJSON(textFile.data);
		if(input.fails) {
			return input;
		}

		const patches = toJSON(patchContent.value);
		if(patches.fails) {
			return patches;
		}

		const patchedData = xtry(() => patch(input.value.data as Parameters<typeof patch>[0], patches.value.data as Parameters<typeof patch>[1]), stringifyError);

		if(patchedData.fails) {
			return ok({
				output: textFile.data,
				reject: '',
			});
		}
		else {
			const output = input.value.stringify(patchedData.value, input.value.transform);

			return ok({
				output,
				reject: '',
			});
		}
	}
	else {
		return applyUnidiff(textFile.data, patchContent.value, {
			ignorePreviouslyApplied: true,
			reject: true,
		});
	}
}

function toJSON(data: string): DResult<{ data: unknown; transform: Transform | undefined; stringify: (data: unknown, transform?: Transform) => string }> {
	const result = JSON.parse(data);

	if(result.fails) {
		const result = JSONC.parse(data);
		if(result.fails) {
			return result;
		}

		return ok({
			data: result.value.data,
			transform: result.value.transform,
			stringify: JSONC.stringify,
		});
	}

	return ok({
		data: result.value.data,
		transform: result.value.transform,
		stringify: JSON.stringify,
	});
}
