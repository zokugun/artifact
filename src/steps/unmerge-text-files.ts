import path from 'path';
import { logger } from '@zokugun/cli-utils';
import fse from '@zokugun/fs-extra-plus/async';
import { isArray, isRecord, type Primitive } from '@zokugun/is-it-type';
import { type AsyncDResult, err, OK, stringifyError } from '@zokugun/xtry';
import { compose } from '../compositors/compose.js';
import { fork } from '../compositors/fork.js';
import { json } from '../compositors/json.js';
import { yaml } from '../compositors/yaml.js';
import { mapDelete } from '../routes/index.js';
import { type Context } from '../types/context.js';
import { buildTravelPlan } from '../utils/build-travel-plan.js';

const mainRoute = compose({
	$$default: fork(
		[isArray, async ({ current }: { current: unknown[] }) => current],
		[isRecord, mapDelete],
		async ({ current }: { current: Primitive }) => current,
	),
});

const jsonRoute = json(mainRoute);
const yamlRoute = yaml(mainRoute);

const travelPlan = buildTravelPlan(
	[/\.json$/, jsonRoute],
	[/\.ya?ml$/, yamlRoute],
);

export async function unmergeTextFiles({ targetPath, textFiles, mergedTextFiles, options }: Context): AsyncDResult {
	for(const file of textFiles) {
		if(options.verbose) {
			logger.debug(`${file.name} is going to be unmerged`);
		}

		const filePath = path.join(targetPath, file.name);

		if(!await fse.isExisting(filePath)) {
			continue;
		}

		const current = await fse.readFile(filePath, 'utf8');
		if(current.fails) {
			return err(stringifyError(current.error));
		}

		const travel = travelPlan(file.name);

		if(travel) {
			if(options.verbose) {
				logger.debug(`${file.name}, an unmerger has been found`);
			}

			const data = await travel({
				current: current.value,
				incoming: file.data,
			});

			mergedTextFiles.push({
				name: file.name,
				data,
				finalNewLine: file.finalNewLine,
				indent: file.indent,
				mode: file.mode,
			});

			if(options.verbose) {
				logger.debug(`${file.name} has been unmerged`);
			}
		}
		else {
			if(options.verbose) {
				logger.debug(`${file.name}, no unmerger has been found`);
			}
		}
	}

	return OK;
}
