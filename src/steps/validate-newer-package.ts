import { type AsyncDResult, OK, OK_FALSE, OK_TRUE } from '@zokugun/xtry';
import { gt } from 'semver';
import { OperationMode, type Context } from '../types/context.js';

export async function validateNewerPackage(context: Context): AsyncDResult<boolean | void> {
	const { incomingPackage, config, global, options } = context;

	if(options.force) {
		return OK;
	}

	const artifact = config.artifacts[incomingPackage!.name];

	if(artifact) {
		const newer = gt(incomingPackage!.version, artifact.version);

		if(newer) {
			return OK_FALSE;
		}
		else if(global.overwrittenTextFiles.length > 0) {
			context.operationMode = OperationMode.OnlyOverwritten;
		}
		else {
			return OK_TRUE;
		}
	}

	return OK;
}
