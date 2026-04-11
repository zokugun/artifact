import { readPackageConfig } from '../configs/index.js';
import { type Context } from '../types/context.js';

export async function readIncomingConfig(context: Context): Promise<boolean | void> {
	if(!context.incomingConfig) {
		const config = await readPackageConfig(context.incomingPath);

		if(!config) {
			return true;
		}

		context.incomingConfig = config;
	}
}
