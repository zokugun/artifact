import fse from '@zokugun/fs-extra-plus/sync';
import { err, stringifyError, ok, type DResult } from '@zokugun/xtry';
import { camelCase } from 'es-toolkit';

const BASENAME_REGEX = /^(.*)\.([^.]+)$/;

export function fixtures(directory: string): DResult<Record<string, Record<string, string>>> {
	const cwd = fse.join('.', 'test', 'fixtures', directory);

	const files = fse.walk(cwd, {
		asPaths: true,
		collect: true,
		onlyFiles: true,
	});
	if(files.fails) {
		return err(stringifyError(files.error));
	}

	const result: Record<string, Record<string, string>> = {};

	for(const file of files.value) {
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

	return ok(result);
}
