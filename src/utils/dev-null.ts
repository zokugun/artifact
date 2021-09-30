import { createWriteStream, WriteStream } from 'fs';

export function createDevNull(): WriteStream {
	return createWriteStream('/dev/null');
}
