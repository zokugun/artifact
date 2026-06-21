import fse from '@zokugun/fs-extra-plus/async';
import { isRecord } from '@zokugun/is-it-type';
import { type AsyncDResult, err, ok, stringifyError } from '@zokugun/xtry/async';
import { type PackageManifest } from '../../types/config.js';

export async function readPackageManifest(targetPath: string): AsyncDResult<PackageManifest> {
	const filePath = fse.resolve(targetPath, 'package.json');

	const result = await fse.readJSON(filePath);
	if(result.fails) {
		return err(stringifyError(result.error));
	}

	if(!isPackageManifest(result.value)) {
		return err('The package of the incoming artifact can\'t be found.');
	}

	return ok(result.value);
}

function isPackageManifest(value: unknown): value is PackageManifest {
	if(!isRecord(value)) {
		return false;
	}

	return typeof value.name === 'string' && typeof value.version === 'string';
}
