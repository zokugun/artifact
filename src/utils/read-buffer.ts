import { Buffer } from 'buffer';
import fs from 'fs/promises';

export async function readBuffer(filepath: string, size: number, offset: number = 0): Promise<Buffer> {
	const buffer = Buffer.alloc(size);
	const file = await fs.open(filepath, 'r');

	try {
		const { bytesRead } = await file.read(buffer as unknown as Uint8Array, 0, size, offset);

		if(bytesRead < size) {
			return buffer.slice(0, bytesRead);
		}
		else {
			return buffer;
		}
	}
	finally {
		await file.close();
	}
}
