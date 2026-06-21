import { logger } from '@zokugun/cli-utils';
import { type DResult, err, OK_UNDEFINED } from '@zokugun/xtry';
import { type InstallConfig, type PackageManifest } from '../../types/config.js';
import { type OperationMode, type Options, type Global } from '../../types/context.js';
import { OK_VALID } from './constants.js';

export function validatePresentPackage(requestPackage: PackageManifest, installConfig: InstallConfig, _global: Global, options: Options): DResult<{ operationMode?: OperationMode } | undefined> {
	if(options.force) {
		return OK_VALID;
	}

	const { name } = requestPackage as { name: string };

	const artifact = installConfig.artifacts[name];

	if(artifact) {
		return OK_VALID;
	}

	if(options.skip) {
		if(options.verbose) {
			logger.debug('The outgoing artifact is already absent, skipping...');
		}

		return OK_UNDEFINED;
	}
	else {
		return err('The outgoing artifact has already been removed.');
	}
}
