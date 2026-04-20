import path from 'path';
import { logger } from '@zokugun/cli-utils';
import fse from '@zokugun/fs-extra-plus/async';
import { isEmptyArray } from '@zokugun/is-it-type';
import { type AsyncDResult, err, OK, stringifyError } from '@zokugun/xtry';
import globby from 'globby';
import { getJourney } from '../journeys/index.js';
import { type Context } from '../types/context.js';
import { detectIndent } from '../utils/detect-indent.js';
import { hasFinalNewLine } from '../utils/has-final-new-line.js';

export async function transformUntouchedFiles({ formats, options, routes, targetPath, textFiles, transformedFiles, transforms }: Context): AsyncDResult {
	if(transforms.length === 0) {
		return OK;
	}

	const cwd = path.join(targetPath);

	const files = await globby(['**/*', '!**/*.lock', '!**/*-lock.*'], {
		cwd,
		dot: true,
	});

	for(const file of files) {
		if(textFiles.some(({ name }) => name === file)) {
			continue;
		}

		const transformations = transforms(file);

		if(!transformations || isEmptyArray(transformations)) {
			continue;
		}

		const journey = routes(file) ?? getJourney(file);

		if(!journey) {
			continue;
		}

		if(options.verbose) {
			logger.debug(`${file} is going to be transformed`);
		}

		const filePath = path.join(cwd, file);

		const result = await fse.readFile(filePath, 'utf8');
		if(result.fails) {
			return err(stringifyError(result.error));
		}

		const data = result.value;
		const finalNewLine = hasFinalNewLine(data);
		const indent = detectIndent(data);

		const transformed = await journey.travel({
			current: data,
			incoming: undefined,
			transforms: transformations,
		});

		transformedFiles.push({
			name: file,
			data: transformed,
			finalNewLine,
			indent,
		});

		if(options.verbose) {
			logger.debug(`${file} has been transformed`);
		}
	}

	return OK;
}
