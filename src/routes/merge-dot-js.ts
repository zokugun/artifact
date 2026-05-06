import { merge } from '@zokugun/configdotts-merge';
import { type Args } from '../types/travel.js';

export async function mergeDotJs({ current, incoming }: Args<string>): Promise<string> {
	const data = merge(current!, incoming!);

	return data;
}
