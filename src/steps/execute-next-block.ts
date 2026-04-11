import { isNil } from 'lodash-es';
import { type Context } from '../types/context.js';

export async function executeNextBlock(context: Context): Promise<void> {
	const block = context.blocks.shift();

	if(!isNil(block)) {
		const { name, version, variant, branch, incomingPath } = block;

		await context.commonFlow(name, version, variant, branch, incomingPath, context);
	}
}
