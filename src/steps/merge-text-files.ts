import path from 'path';
import { logger } from '@zokugun/cli-utils';
import fse from '@zokugun/fs-extra-plus/async';
import { type AsyncDResult, err, OK, stringifyError } from '@zokugun/xtry';
import { getJourney } from '../journeys/index.js';
import { type Context } from '../types/context.js';

export async function mergeTextFiles({ targetPath, textFiles, mergedTextFiles, onExisting, onMissing, filters, routes, transforms, options }: Context): AsyncDResult {
	for(const file of textFiles) {
		if(options.verbose) {
			logger.debug(`${file.name} is going to be merged`);
		}

		const journey = routes(file.name) ?? getJourney(file.name);

		if(!journey) {
			if(options.verbose) {
				logger.debug(`${file.name}, no merger has been found`);
			}

			const filePath = path.join(targetPath, file.name);

			if(await fse.isExisting(filePath)) {
				switch(onExisting(file.name)) {
					case 'merge': {
						break;
					}

					case 'overwrite': {
						break;
					}

					case 'skip': {
						continue;
					}
				}
			}
			else {
				switch(onMissing(file.name)) {
					case 'continue': {
						break;
					}

					case 'skip': {
						continue;
					}
				}
			}

			mergedTextFiles.push(file);

			if(options.verbose) {
				logger.debug(`${file.name} has been copied`);
			}

			continue;
		}

		if(options.verbose) {
			logger.debug(`${file.name}, a merger has been found`);
		}

		const fileName = journey.alias ? path.join(path.dirname(file.name), journey.alias) : file.name;
		const filePath = path.join(targetPath, fileName);

		if(await fse.isExisting(filePath)) {
			switch(onExisting(file.name)) {
				case 'merge': {
					const current = await fse.readFile(filePath, 'utf8');
					if(current.fails) {
						return err(stringifyError(current.error));
					}

					const data = await journey.travel({
						current: current.value,
						incoming: file.data,
						filters: filters(file.name),
						transforms: transforms(file.name),
					});

					mergedTextFiles.push({
						name: fileName,
						data,
						finalNewLine: file.finalNewLine,
						mode: file.mode,
					});

					if(options.verbose) {
						logger.debug(`${file.name} has been merged`);
					}

					break;
				}

				case 'overwrite': {
					mergedTextFiles.push(file);

					if(options.verbose) {
						logger.debug(`${file.name} has been overwritten`);
					}

					continue;
				}

				case 'skip': {
					continue;
				}
			}
		}
		else {
			switch(onMissing(file.name)) {
				case 'continue': {
					mergedTextFiles.push({
						...file,
						name: fileName,
					});

					if(options.verbose) {
						logger.debug(`${file.name} has been copied`);
					}

					continue;
				}

				case 'skip': {
					continue;
				}
			}
		}
	}

	return OK;
}
