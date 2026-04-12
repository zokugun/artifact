import { type AsyncDResult, OK } from '@zokugun/xtry';
import { type Context } from '../types/context.js';

export async function configureUninstallFileActions(context: Context): AsyncDResult {
	const { uninstall } = context.incomingConfig!;

	if(!uninstall) {
		return OK;
	}

	for(const [file, fileUpdate] of Object.entries(uninstall)) {
		const { remove } = fileUpdate;

		if(remove) {
			context.removedPatterns.push(file);

			continue;
		}
	}

	return OK;
}
