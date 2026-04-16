import path from 'node:path';
import fse from '@zokugun/fs-extra-plus/sync';
import { isRecord, isString } from '@zokugun/is-it-type';
import { expect } from 'chai';
import { vol } from 'memfs';
import YAML from 'yaml';
import { update } from '../rewires/artifact.js';

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
			let expectedCount = 0;

			for(const [key, data] of Object.entries(manifest)) {
				if(key.startsWith('/target/') || key.startsWith('/incoming/')) {
					fromJSON[key] = data;
				}
				else if(key.startsWith('/merged/')) {
					expectedFiles[key.slice(8)] = data;
					expectedCount += 1;
				}
			}

			let action: () => Promise<void>;

			if(!isRecord(manifest.action) || !isString(manifest.action.command)) {
				throw new Error(`The file "${path.relative(root, filePath)}" requires an "action" entry.`);
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

					for(const [file, data] of Object.entries(expectedFiles)) {
						expect(vol.readFileSync(`/target/${file}`, 'utf8')).to.eql(data);
					}

					expect(Object.keys(vol.toJSON()).filter((file) => file.startsWith('/target/')).length).to.eql(expectedCount);
				});
			}
		}
	}
}
