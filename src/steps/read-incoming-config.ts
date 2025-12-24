import { readPackageConfig } from '../configs';
import { Context } from '../types/context';

export async function readIncomingConfig(context: Context): Promise<boolean | void> {
	if(!context.incomingConfig) {
		const config = await readPackageConfig(context.incomingPath);

		if(!config) {
			return true;
		}

		context.incomingConfig = config;
	}
}
