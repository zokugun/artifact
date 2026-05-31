import { isNonNullable } from '@zokugun/is-it-type';
import { type AsyncDResult, OK } from '@zokugun/xtry';
import { type Context } from '../types/context.js';

export async function executeNextBlock(context: Context): AsyncDResult {
	const block = context.blocks.shift();

	if(isNonNullable(block)) {
		const { name, version, variant, branch, incomingPath } = block;

		const result = await context.commonFlow(name, version, variant, branch, incomingPath, context);
		if(result.fails) {
			return result;
		}
	}

	return OK;
}
