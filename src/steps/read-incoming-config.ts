import { Context } from '../types/context';
import { readConfig } from '../config';

export async function readIncomingConfig(context: Context): Promise<void> {
	const [config] = await readConfig(context.incomingPath);

	context.incomingConfig = config;
}
