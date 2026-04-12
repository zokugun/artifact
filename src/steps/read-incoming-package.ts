import path from 'path';
import fse from '@zokugun/fs-extra-plus/async';
import { err, OK, stringifyError } from '@zokugun/xtry';
import { type AsyncDResult } from '@zokugun/xtry/sync';
import { isNil, isPlainObject } from 'lodash-es';
import { type PackageManifest } from '../types/config.js';
import { type Context } from '../types/context.js';

export async function readIncomingPackage(context: Context): AsyncDResult {
	const filePath = path.resolve(context.incomingPath, './package.json');

	const result = await fse.readJSON(filePath);
	if(result.fails) {
		return err(stringifyError(result.error));
	}

	if(!isPackageManifest(result.value)) {
		return err('The package of the incoming artifact can\'t be found.');
	}

	context.incomingPackage = result.value;

	return OK;
}

function isPackageManifest(value: unknown): value is PackageManifest {
	if(isNil(value) || !isPlainObject(value)) {
		return false;
	}

	const manifest = value as Record<string, unknown>;

	return typeof manifest.name === 'string' && typeof manifest.version === 'string';
}
