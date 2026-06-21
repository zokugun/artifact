import { type DResult, ok, OK_UNDEFINED } from '@zokugun/xtry';
import { eq, gt } from 'semver';
import { type InstallConfig, type PackageManifest } from '../../types/config.js';
import { OperationMode, type Options, type Global } from '../../types/context.js';
import { OK_VALID } from './constants.js';

export function validateNewerPackage(requestPackage: PackageManifest, installConfig: InstallConfig, global: Global, options: Options): DResult<{ operationMode?: OperationMode } | undefined> {
	if(options.force) {
		return OK_VALID;
	}

	const artifact = installConfig.artifacts[requestPackage.name];

	if(artifact) {
		const newer = gt(requestPackage.version, artifact.version);

		if(newer) {
			return OK_VALID;
		}
		else if(eq(requestPackage.version, artifact.version)) {
			return ok({ operationMode: OperationMode.OnlyOverwritten });
		}
		else {
			return OK_UNDEFINED;
		}
	}

	return OK_VALID;
}
