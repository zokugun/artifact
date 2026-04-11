import { gt } from 'semver';
import { type Context } from '../types/context.js';

export async function validateNewerPackage({ incomingPackage, config, options }: Context): Promise<boolean | void> {
	if(options.force) {
		return;
	}

	const artifact = config.artifacts[incomingPackage!.name];

	if(artifact) {
		return !gt(incomingPackage!.version, artifact.version);
	}
}
