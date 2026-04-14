import { isEqual, uniqWith } from 'lodash-es';

export async function listConcat({ current, incoming }: { current: unknown[] | undefined; incoming: unknown[] | undefined }): Promise<any[]> {
	if(!incoming) {
		return current ?? [];
	}

	if(!current) {
		return incoming;
	}

	return uniqWith([...current, ...incoming], isEqual);
}
