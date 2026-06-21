import { c, logger } from '@zokugun/cli-utils';
import fse from '@zokugun/fs-extra-plus/async';
import { isNullable, isNumber, isString } from '@zokugun/is-it-type';
import { type AsyncDResult, type DResult, err, OK } from '@zokugun/xtry/async';
import { readPackageConfig } from '../configs/index.js';
import { readPackageManifest } from '../configs/package/read-package-manifest.js';
import { type ArtifactResult, type InstallConfig, type PackageConfig, type PackageManifest, type Request } from '../types/config.js';
import { type FlowEntry, type OperationType, type Global, OperationMode, type Options } from '../types/context.js';
import { loadPackage } from '../utils/load-package.js';
import { pushEntry } from './push-entry.js';

export type RequestValidator = (requestPackage: PackageManifest, installConfig: InstallConfig, global: Global, options: Options) => DResult<{ operationMode?: OperationMode } | undefined>;

export async function resolveRequest(request: Request, entries: FlowEntry[], features: string[], operationType: OperationType, validate: RequestValidator, installConfig: InstallConfig, global: Global, options: Options): AsyncDResult {
	const spinner = logger.createSpinner(`${c.cyan.bold(request.name)}`);
	const packagePath = await loadPackage(request.name, spinner, { ...options, before: global.before });

	if(!packagePath) {
		spinner.succeed();

		return OK;
	}

	const manifestResult = await readPackageManifest(packagePath);
	if(manifestResult.fails) {
		return manifestResult;
	}

	const validation = validate(manifestResult.value, installConfig, global, options);
	if(validation.fails) {
		spinner.fail();

		return validation;
	}

	let operationMode = OperationMode.Default;

	if(validation.value) {
		if(isNumber(validation.value.operationMode)) {
			operationMode = validation.value.operationMode;
		}
	}
	else {
		spinner.succeed();

		return OK;
	}

	const configResult = await readPackageConfig(packagePath, global.routes, operationType);
	if(configResult.fails) {
		return configResult;
	}

	const { name, version } = manifestResult.value;
	const config = configResult.value;
	const root = String(config.variants?.root ?? '');

	if(request.variant) {
		let variant: string;

		if(isNullable(config.variants[request.variant])) {
			variant = request.variant;
		}
		else {
			variant = config.variants[request.variant];
		}

		const result = toResult(name, version, request);

		const pushResult = await pushVariant(packagePath, config, root, { name, version, operationMode }, variant, true, result, entries, features, operationType, global);
		if(pushResult.fails) {
			spinner.fail();

			return pushResult;
		}
	}
	else if(root.length > 0) {
		const result = toResult(name, version, request);

		const pushResult = await pushEntry({ name, version, variant: root, dir: fse.join(packagePath, 'variants', root), operationMode }, true, result, entries, features, operationType, global);
		if(pushResult.fails) {
			spinner.fail();

			return pushResult;
		}
	}
	else {
		const pushResult = await pushEntry({ name, version, dir: packagePath, config, operationMode }, true, { name, version }, entries, features, operationType, global);
		if(pushResult.fails) {
			spinner.fail();

			return pushResult;
		}
	}

	spinner.succeed();

	return OK;
}

function toResult(name: string, version: string, request: Request): ArtifactResult {
	const result: ArtifactResult = {
		name,
		version,
	};

	if(isString(request.variant)) {
		result.requires = [request.variant];
	}

	return result;
}

async function pushVariant(packagePath: string, config: PackageConfig, root: string, entry: { name: string; version: string; operationMode: OperationMode }, variant: string, top: boolean, result: ArtifactResult, entries: FlowEntry[], features: string[], operationType: OperationType, global: Global): AsyncDResult {
	const variantPath = fse.join(packagePath, 'variants', variant);
	const configResult = await readPackageConfig(variantPath, global.routes, operationType);
	if(configResult.fails) {
		return configResult;
	}

	const variantConfig = configResult.value;

	if(variantConfig.orphan) {
		const variantResult = await pushEntry({ ...entry, variant, dir: variantPath, config: variantConfig }, top, result, entries, features, operationType, global);
		if(variantResult.fails) {
			return variantResult;
		}
	}
	else if(variantConfig.extends) {
		const extend = config.variants[variantConfig.extends] ?? variantConfig.extends;

		const extendResult = await pushVariant(packagePath, config, root, entry, extend, false, result, entries, features, operationType, global);
		if(extendResult.fails) {
			return extendResult;
		}

		const variantResult = await pushEntry({ ...entry, variant, dir: variantPath, config: variantConfig }, top, result, entries, features, operationType, global);
		if(variantResult.fails) {
			return variantResult;
		}
	}
	else {
		if(root.length === 0) {
			return err('No root variant has been defined');
		}

		if(root === variant) {
			const variantResult = await pushEntry({ ...entry, variant, dir: variantPath, config: variantConfig }, top, result, entries, features, operationType, global);
			if(variantResult.fails) {
				return variantResult;
			}
		}
		else {
			const rootResult = await pushVariant(packagePath, config, root, entry, root, false, result, entries, features, operationType, global);
			if(rootResult.fails) {
				return rootResult;
			}

			const variantResult = await pushEntry({ ...entry, variant, dir: variantPath, config: variantConfig }, top, result, entries, features, operationType, global);
			if(variantResult.fails) {
				return variantResult;
			}
		}
	}

	return OK;
}
