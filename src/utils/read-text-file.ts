import { logger } from '@zokugun/cli-utils';
import fse from '@zokugun/fs-extra-plus/async';
import { err, ok, stringifyError } from '@zokugun/xtry';
import { type Options } from '../types/context.js';
import { detectIndent } from './detect-indent.js';
import { hasFinalNewLine } from './has-final-new-line.js';

export async function readTextFile(file: string, filePath: string, options: Options) {
	const result = await fse.readFile(filePath, 'utf8');
	if(result.fails) {
		return err(stringifyError(result.error));
	}

	const data = result.value;
	const finalNewLine = hasFinalNewLine(data);
	const indent = detectIndent(data);

	if(data.startsWith('#!')) {
		// the text file might be executable
		const result = await fse.stat(filePath);
		if(result.fails) {
			return err(stringifyError(result.error));
		}

		const { mode } = result.value;

		if(options.verbose) {
			logger.debug(`${file} is a shebang file`);
		}

		return ok({
			name: file,
			data,
			finalNewLine,
			indent,
			mode,
		});
	}
	else {
		if(options.verbose) {
			logger.debug(`${file} is a text file`);
		}

		return ok({
			name: file,
			data,
			finalNewLine,
			indent,
		});
	}
}
