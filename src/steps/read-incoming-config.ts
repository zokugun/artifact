import { readConfig } from '../config';
import { Context } from '../types/context';

export async function readIncomingConfig(context: Context): Promise<void> {
	const [config] = await readConfig(context.incomingPath);

	context.incomingConfig = config;
}
