import { type AsyncDResult, OK } from '@zokugun/xtry';
import { readPackageConfig } from '../configs/index.js';
import { type Context } from '../types/context.js';

export async function readIncomingConfig(context: Context): AsyncDResult<boolean | void> {
	if(!context.incomingConfig) {
		const config = await readPackageConfig(context.incomingPath);

		if(config.fails) {
			return config;
		}

		context.incomingConfig = config.value;
	}

	return OK;
}
