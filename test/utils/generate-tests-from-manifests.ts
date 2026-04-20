import path from 'node:path';
import process from 'node:process';
import fse from '@zokugun/fs-extra-plus/sync';
import { isArray, isRecord, isString } from '@zokugun/is-it-type';
import { expect } from 'chai';
import { vol } from 'memfs';
import YAML from 'yaml';
import { add, remove, update } from '../rewires/artifact.js';

const DEBUG = process.env.DEBUG === '1' || process.env.DEBUG === 'true' || process.env.DEBUG === 'on';

export function generateTestsFromManifests(directory: string): void {
	beforeEach(async () => { // {{{
		vol.reset();
	}); // }}}

	const root = path.join('.', 'test', 'fixtures', directory);

	const walkResult = fse.walk(root, {
		absolute: true,
		onlyFiles: true,
		filter: (item) => item.path.endsWith('.yml'),
	});

	if(walkResult.fails) {
		throw walkResult.error;
	}
	else {
		for(const file of walkResult.value) {
			if(file.fails) {
				throw file.error;
			}

			const filePath = file.value.path;
			const name = path.basename(filePath).slice(0, path.basename(filePath).lastIndexOf('.'));

			const readResult = fse.readFile(filePath, 'utf8');
			const manifest = YAML.parse(readResult.value!) as unknown;

			if(!isRecord(manifest)) {
				throw new Error(`The file "${path.relative(root, filePath)}" isn't an object.`);
			}

			const fromJSON = {};
			const expectedFiles = {};

			for(const [key, data] of Object.entries(manifest)) {
				if(key.startsWith('/target/') || key.startsWith('/incoming/')) {
					fromJSON[key] = data;
				}
				else if(key.startsWith('/merged/')) {
					expectedFiles[key.slice(8)] = data;
				}
			}

			let action: () => Promise<void>;

			if(!isRecord(manifest.action) || !isString(manifest.action.command)) {
				throw new Error(`The file "${path.relative(root, filePath)}" requires an "action" entry.`);
			}
			else if(manifest.action.command === 'add') {
				if(!isArray(manifest.action.arguments)) {
					throw new Error(`The file "${path.relative(root, filePath)}" requires an "action.arguments" entry (array).`);
				}

				const specs = manifest.action.arguments[0];

				if(!isArray<string>(specs, isString)) {
					throw new Error(`The file "${path.relative(root, filePath)}" requires an "action.arguments[0]" to be an array of string.`);
				}

				const options = manifest.action.arguments[1] ?? {};
				if(!isRecord(options)) {
					throw new Error(`The file "${path.relative(root, filePath)}" requires an "action.arguments[1]" to be the options.`);
				}

				action = async () => add(specs, { ...options, verbose: DEBUG });
			}
			else if(manifest.action.command === 'remove') {
				if(!isArray(manifest.action.arguments)) {
					throw new Error(`The file "${path.relative(root, filePath)}" requires an "action.arguments" entry (array).`);
				}

				const specs = manifest.action.arguments[0];

				if(!isArray<string>(specs, isString)) {
					throw new Error(`The file "${path.relative(root, filePath)}" requires an "action.arguments[0]" to be an array of string.`);
				}

				action = async () => remove(specs, { verbose: DEBUG });
			}
			else if(manifest.action.command === 'update') {
				action = async () => update();
			}
			else {
				throw new Error(`Unknown action "${manifest.action.command}"`);
			}

			if(isString(manifest.error)) {
				const { error } = manifest;

				it(name, async () => {
					vol.fromJSON(fromJSON);

					await expect(action()).to.be.rejectedWith(error);
				});
			}
			else {
				it(name, async () => {
					vol.fromJSON(fromJSON);

					await action();

					if(DEBUG) {
						console.log(vol.toJSON());
					}

					for(const [file, data] of Object.entries(expectedFiles)) {
						const action = vol.promises.readFile(`/target/${file}`, 'utf8');

						if(isString(data)) {
							expect(await action).to.eql(data);
						}
						else {
							await expect(action).to.be.rejectedWith(`${(data as any).error}, open '/target/${file}'`);
						}
					}
				});
			}
		}
	}
}
