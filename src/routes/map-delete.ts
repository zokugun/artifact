import { isArray, isEmptyRecord, isRecord } from '@zokugun/is-it-type';

export function mapDelete({ current, incoming }: { current: Record<string, unknown> | undefined; incoming: Record<string, unknown> | undefined }): Record<string, unknown> {
	if(!incoming) {
		return current ?? {};
	}

	if(!current) {
		return {};
	}

	for(const [key, value] of Object.entries(incoming)) {
		if(isArray(value) && isArray(current[key])) {
			return current;
		}
		else if(isRecord(value) && isRecord(current[key])) {
			const newValue = mapDelete({ current: current[key], incoming: value });

			if(isEmptyRecord(newValue)) {
				delete current[key];
			}
			else {
				current[key] = newValue;
			}
		}
		else {
			if(current[key] === value) {
				delete current[key];
			}
		}
	}

	return current;
}
