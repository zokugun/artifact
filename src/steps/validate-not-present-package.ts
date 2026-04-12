import { logger } from '@zokugun/cli-utils';
import { type Context } from '../types/context.js';

export async function validateNotPresentPackage({ incomingPackage, config, options }: Context): Promise<boolean | void> {
	if(options.force) {
		return;
	}

	const { name } = incomingPackage as { name: string };

	const artifact = config.artifacts[name];

	if(artifact) {
		if(options.skip) {
			if(options.verbose) {
				logger.debug('The incoming artifact is already present, skipping...');
			}

			return true;
		}
		else {
			throw new Error('The incoming artifact has already been added.');
		}
	}
}
