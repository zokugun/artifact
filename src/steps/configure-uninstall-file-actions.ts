import { type Context } from '../types/context.js';

export async function configureUninstallFileActions(context: Context): Promise<void> {
	const { uninstall } = context.incomingConfig!;

	if(!uninstall) {
		return;
	}

	for(const [file, fileUpdate] of Object.entries(uninstall)) {
		const { remove } = fileUpdate;

		if(remove) {
			context.removedPatterns.push(file);

			continue;
		}
	}
}
