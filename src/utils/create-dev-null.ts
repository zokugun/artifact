// eslint-disable-next-line unicorn/prevent-abbreviations
import { createWriteStream, type WriteStream } from 'fs';

// eslint-disable-next-line unicorn/prevent-abbreviations
export function createDevNull(): WriteStream {
	return createWriteStream('/dev/null');
}
