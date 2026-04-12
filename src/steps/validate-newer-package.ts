import { type AsyncDResult, OK, ok } from '@zokugun/xtry';
import { gt } from 'semver';
import { type Context } from '../types/context.js';

export async function validateNewerPackage({ incomingPackage, config, options }: Context): AsyncDResult<boolean | void> {
	if(options.force) {
		return OK;
	}

	const artifact = config.artifacts[incomingPackage!.name];

	if(artifact) {
		return ok(!gt(incomingPackage!.version, artifact.version));
	}

	return OK;
}
