import path from 'path';
import fse from 'fs-extra';
import { isNil, isPlainObject } from 'lodash';
import { PackageManifest } from '../types/config';
import { Context } from '../types/context';

export async function readIncomingPackage(context: Context): Promise<void> {
	const filePath = path.resolve(context.incomingPath, './package.json');

	const incomingPackage = await fse.readJSON(filePath) as unknown;
	if(!isPackageManifest(incomingPackage)) {
		throw new Error('The package of the incoming artifact can\'t be found.');
	}

	context.incomingPackage = incomingPackage;
}

function isPackageManifest(value: unknown): value is PackageManifest {
	if(isNil(value) || !isPlainObject(value)) {
		return false;
	}

	const manifest = value as Record<string, unknown>;

	return typeof manifest.name === 'string' && typeof manifest.version === 'string';
}
