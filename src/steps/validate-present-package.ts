import { logger } from '@zokugun/cli-utils';
import { type Context } from '../types/context.js';

export async function validatePresentPackage({ incomingPackage, config, options }: Context): Promise<boolean | void> {
	if(options.force) {
		return;
	}

	const { name } = incomingPackage as { name: string };

	const artifact = config.artifacts[name];

	if(!artifact) {
		if(options.skip) {
			if(options.verbose) {
				logger.debug('The outgoing artifact is already absent, skipping...');
			}

			return true;
		}
		else {
			throw new Error('The outgoing artifact has already been removed.');
		}
	}
}
