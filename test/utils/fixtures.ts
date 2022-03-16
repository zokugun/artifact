import { readFileSync } from 'fs';
import path from 'path';
import camelcase from 'camelcase';
import globby from 'globby';

const BASENAME_REGEX = /^(.*)\.([^.]+)$/;

export function fixtures(directory: string): Record<string, Record<string, string>> {
	const cwd = path.join('.', 'test', 'fixtures', directory);
	const files = globby.sync('**/*', {
		cwd,
	});

	const result: Record<string, Record<string, string>> = {};

	for(const file of files) {
		const match = BASENAME_REGEX.exec(path.basename(file));

		if(match) {
			const groupName = camelcase(path.dirname(file));
			const caseName = camelcase(match[1]);

			if(!result[groupName]) {
				result[groupName] = {};
			}

			result[groupName][caseName] = readFileSync(path.join(cwd, file), 'utf-8');
		}
	}

	return result;
}
