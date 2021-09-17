import fs from 'fs/promises';
import { Buffer } from 'buffer';

export async function readBuffer(filepath: string, size: number, offset: number = 0): Promise<Buffer> {
	const buffer = Buffer.alloc(size);
	const file = await fs.open(filepath, 'r');

	try {
		const { bytesRead } = await file.read(buffer, offset, size, 0);

		if(bytesRead < size) {
			const smaller = Buffer.alloc(bytesRead);

			buffer.copy(smaller, 0, 0, bytesRead);

			return smaller;
		}
		else {
			return buffer;
		}
	}
	finally {
		await file.close();
	}
}
