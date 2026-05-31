import fse from '@zokugun/fs-extra-plus/sync';
import { camelCase } from 'es-toolkit';
import globby from 'globby';

const BASENAME_REGEX = /^(.*)\.([^.]+)$/;

export function fixtures(directory: string): Record<string, Record<string, string>> {
	const cwd = fse.join('.', 'test', 'fixtures', directory);
	const files = globby.sync('**/*', {
		cwd,
	});

	const result: Record<string, Record<string, string>> = {};

	for(const file of files) {
		const match = BASENAME_REGEX.exec(fse.leafName(file));

		if(match) {
			const groupName = camelCase(fse.parentName(file));
			const caseName = camelCase(match[1]);

			result[groupName] ||= {};

			const content = fse.readFile(fse.join(cwd, file), 'utf8');
			if(content.fails) {
				throw content.error;
			}

			result[groupName][caseName] = content.value;
		}
	}

	return result;
}
