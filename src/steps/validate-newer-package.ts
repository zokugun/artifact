import { gt } from 'semver';
import { Context } from '../types/context';

export async function validateNewerPackage({ incomingPackage, config, options }: Context): Promise<boolean | void> {
	if(options.force) {
		return;
	}

	const artifact = config.artifacts[incomingPackage!.name];

	if(artifact) {
		return !gt(incomingPackage!.version, artifact.version);
	}
}
