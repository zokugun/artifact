import path from 'path';
import fse from 'fs-extra';
import { Context } from '../types/context';

export async function readIncomingPackage(context: Context): Promise<void> {
	const filePath = path.resolve(context.incomingPath, './package.json');

	context.incomingPackage = await fse.readJSON(filePath) as Record<string, any> | undefined;
}
