import path from 'node:path';
import fse from '@zokugun/fs-extra-plus/sync';
import { expect } from 'chai';
import globby from 'globby';
import { vol } from 'memfs';

export function generateTestsFromDirectory(directory: string, action: () => Promise<void>): void {
	beforeEach(async () => { // {{{
		vol.reset();
	}); // }}}

	const cwd = path.join('.', 'test', 'fixtures', directory);

	const tests = globby.sync('*', {
		cwd,
		onlyDirectories: true,
	});

	for(const name of tests) {
		const root = path.join(cwd, name);
		const fromFiles = globby.sync(['target/**', 'incoming/**'], {
			cwd: root,
			dot: true,
		});
		const expectedFiles = globby.sync('**', {
			cwd: path.join(root, 'merged'),
			dot: true,
		});

		const fromJSON = {};

		for(const file of fromFiles) {
			fromJSON[`/${file}`] = fse.readFile(path.join(root, file), 'utf8').value!;
		}

		it(name, async () => {
			vol.fromJSON(fromJSON);

			await action();

			for(const file of expectedFiles) {
				expect(vol.readFileSync(`/target/${file}`, 'utf8')).to.eql(fse.readFile(path.join(root, 'merged', file), 'utf8').value!);
			}

			expect(Object.keys(vol.toJSON()).filter((file) => file.startsWith('/target/')).length).to.eql(expectedFiles.length);
		});
	}
}
