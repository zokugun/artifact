import { type AsyncDResult, OK } from '@zokugun/xtry';
import { readPackageConfig } from '../configs/index.js';
import { type Context } from '../types/context.js';

export async function readIncomingConfig(context: Context): AsyncDResult<boolean | void> {
	if(!context.incomingConfig) {
		const config = await readPackageConfig(context.incomingPath, context.global.routes, context.operationType);
		if(config.fails) {
			return config;
		}

		if(context.result && config.value.features.length > 0) {
			context.result.features ??= [];

			context.result.features.push(...config.value.features);
		}

		context.incomingConfig = config.value;
	}

	return OK;
}
