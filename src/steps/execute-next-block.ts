import { type AsyncDResult, OK } from '@zokugun/xtry';
import { isNil } from 'lodash-es';
import { type Context } from '../types/context.js';

export async function executeNextBlock(context: Context): AsyncDResult {
	const block = context.blocks.shift();

	if(!isNil(block)) {
		const { name, version, variant, branch, incomingPath } = block;

		const result = await context.commonFlow(name, version, variant, branch, incomingPath, context);
		if(result.fails) {
			return result;
		}
	}

	return OK;
}
