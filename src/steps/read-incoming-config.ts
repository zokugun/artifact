import { type AsyncDResult, OK, OK_TRUE } from '@zokugun/xtry';
import { readPackageConfig } from '../configs/index.js';
import { type Context } from '../types/context.js';

export async function readIncomingConfig(context: Context): AsyncDResult<boolean | void> {
	if(!context.incomingConfig) {
		const config = await readPackageConfig(context.incomingPath);

		if(config.fails) {
			return OK_TRUE;
		}

		context.incomingConfig = config.value;
	}

	return OK;
}
