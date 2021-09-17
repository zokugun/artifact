import isEqual from 'lodash/isEqual';
import uniqWith from 'lodash/uniqWith';

export function listConcat({ current, incoming }: { current: unknown[] | undefined; incoming: unknown[] | undefined }): any[] {
	if(!incoming) {
		return current ?? [];
	}

	if(!current) {
		return incoming;
	}

	return uniqWith([...current, ...incoming], isEqual);
}
