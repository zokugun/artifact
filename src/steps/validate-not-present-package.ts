import { logger } from '@zokugun/cli-utils';
import { type AsyncDResult, err, OK, OK_TRUE } from '@zokugun/xtry';
import { type Context } from '../types/context.js';

export async function validateNotPresentPackage({ incomingPackage, config, options }: Context): AsyncDResult<boolean | void> {
	if(options.force) {
		return OK;
	}

	const { name } = incomingPackage as { name: string };

	const artifact = config.artifacts[name];

	if(artifact) {
		if(options.skip) {
			if(options.verbose) {
				logger.debug('The incoming artifact is already present, skipping...');
			}

			return OK_TRUE;
		}
		else {
			return err('The incoming artifact has already been added.');
		}
	}

	return OK;
}
