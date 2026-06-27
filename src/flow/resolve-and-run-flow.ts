import { c, logger } from '@zokugun/cli-utils';
import fse from '@zokugun/fs-extra-plus/async';
import { isNonEmptyRecord } from '@zokugun/is-it-type';
import { type AsyncDResult, type DResult, OK } from '@zokugun/xtry';
import { readPackageConfig, writeInstallConfig } from '../configs/index.js';
import { type InstallConfig, type Request } from '../types/config.js';
import { OperationType, type Global, type FlowEntry, type Options, type CommonFlow, type ConfigUpdater, OperationMode } from '../types/context.js';
import { loadPackage } from '../utils/load-package.js';
import { applyPatchFiles } from './apply-patch-files.js';
import { buildLabel } from './build-label.js';
import { resolveBranches } from './resolve-branches.js';
import { type RequestValidator, resolveRequest } from './resolve-request.js';

export async function resolveAndRunFlow(requests: Iterable<DResult<Request>>, resolveInstalled: boolean, setupInstalled: boolean, operationType: OperationType, validate: RequestValidator, targetPath: string, commonFlow: CommonFlow, updateConfig: ConfigUpdater, config: InstallConfig, global: Global, options: Options): AsyncDResult {
	const entries: FlowEntry[] = [];
	const availables: string[] = [];
	const features: string[] = [];

	for(const request of requests) {
		if(request.fails) {
			return request;
		}

		const result = await resolveRequest(request.value, entries, availables, features, operationType, validate, config, global, options);
		if(result.fails) {
			return result;
		}
	}

	const allEntries: FlowEntry[] = [...entries];
	const resolvedBranches: string[] = [];

	if(resolveInstalled) {
		const requested: string[] = [];

		for(const [name, { provides, requires }] of Object.entries(config.artifacts)) {
			if(availables.includes(name)) {
				requested.push(name);
			}
			else {
				availables.push(name);

				if(requires) {
					for(const variant of requires) {
						availables.push(`${name}:${variant}`);
					}
				}

				if(provides) {
					for(const variant of provides) {
						availables.push(`${name}:${variant}`);
					}
				}
			}
		}

		const versions: Record<string, string> = {};

		if(requested.length > 0) {
			for(const entry of entries) {
				if(requested.includes(entry.name)) {
					versions[entry.name] = entry.version;
				}
			}
		}

		for(const [name, artifact] of Object.entries(config.artifacts)) {
			const spinner = requested.includes(name) ? undefined : logger.createSpinner(`${c.cyan.bold(name)}`);
			const version = versions[name] ?? artifact.version;
			const dir = await loadPackage(`${name}@${version}`, spinner, options);

			if(!dir) {
				spinner?.succeed();

				continue;
			}

			let index = allEntries.findIndex((entry) => entry.name === name);
			const operationMode = index >= 0 ? allEntries[index].operationMode : OperationMode.Default;

			const result = await resolveBranchesForInstalledPackage(dir, name, version, undefined, operationMode, setupInstalled, operationType, availables, features, config, global, options);
			if(result.fails) {
				spinner?.fail();

				return result;
			}

			resolvedBranches.push(name);

			if(result.value.length > 0) {
				index += 1;

				while(index < allEntries.length && allEntries[index].name === name) {
					index += 1;
				}

				allEntries.splice(index, 0, ...result.value);
			}

			if(artifact.requires) {
				for(const variant of artifact.requires) {
					const index = allEntries.findIndex((entry) => entry.name === name && entry.variant === variant);
					const operationMode = index === -1 ? OperationMode.Default : allEntries[index].operationMode;

					const result = await resolveBranchesForInstalledPackage(fse.join(dir, 'variants', variant), name, version, variant, operationMode, setupInstalled, operationType, availables, features, config, global, options);
					if(result.fails) {
						spinner?.fail();

						return result;
					}

					resolvedBranches.push(`${name}:${variant}`);

					if(result.value.length > 0) {
						allEntries.splice(index + 1, 0, ...result.value);
					}
				}
			}

			if(artifact.provides) {
				for(const variant of artifact.provides) {
					const index = allEntries.findIndex((entry) => entry.name === name && entry.variant === variant);
					const operationMode = index === -1 ? OperationMode.Default : allEntries[index].operationMode;

					const result = await resolveBranchesForInstalledPackage(fse.join(dir, 'variants', variant), name, version, variant, operationMode, setupInstalled, operationType, availables, features, config, global, options);
					if(result.fails) {
						spinner?.fail();

						return result;
					}

					resolvedBranches.push(`${name}:${variant}`);

					if(result.value.length > 0) {
						allEntries.splice(index + 1, 0, ...result.value);
					}
				}
			}

			spinner?.succeed();
		}

		for(const entry of entries) {
			if(resolvedBranches.includes(entry.variant ? `${entry.name}:${entry.variant}` : entry.name)) {
				continue;
			}

			const result = await resolveBranches(entry, availables, features, options);
			if(result.fails) {
				return result;
			}

			if(result.value.length > 0) {
				const index = allEntries.indexOf(entry);

				allEntries.splice(index + 1, 0, ...result.value);
			}
		}
	}

	for(const { dir, config: incomingConfig, name, version, variant, branch, operationMode, result } of allEntries) {
		const label = buildLabel(name, version, variant, branch, operationMode);
		const spinner = logger.createSpinner(`${c.cyan.bold(label)}`);

		const flowResult = await commonFlow(targetPath, { name, version, variant, branch, dir, config: incomingConfig }, undefined, label, operationMode, result, config, global, options);
		if(flowResult.fails) {
			spinner.fail();

			return flowResult;
		}

		const context = flowResult.value;

		if(context?.incomingConfig) {
			for(const { name, plan, scope } of context.incomingConfig.journeys) {
				if(scope === 'global') {
					global.journeys[name] = plan;
				}
			}

			for(const [name, route] of Object.entries(context.incomingConfig.routes)) {
				if(route.scope === 'global') {
					global.routes[name] = route;
				}
			}
		}
		else {
			const result = await readPackageConfig(dir, global.routes, OperationType.Update);
			if(result.fails) {
				spinner.fail();

				return result;
			}

			for(const { name, plan, scope } of result.value.journeys) {
				if(scope === 'global') {
					global.journeys[name] = plan;
				}
			}

			for(const [name, spec] of Object.entries(result.value.routes)) {
				if(spec.scope === 'global') {
					global.routes[name] = spec;
				}
			}
		}

		if(!flowResult.value?.result) {
			spinner.succeed();

			continue;
		}

		updateConfig(config, flowResult.value.result);

		const writeResult = await writeInstallConfig(config, flowResult.value.formats, targetPath, options);
		if(writeResult.fails) {
			spinner.fail();

			return writeResult;
		}

		spinner.succeed();
	}

	const customDir = fse.join(targetPath, '.artifact');

	if(await fse.isNonEmptyDir(customDir)) {
		const label = '.artifact';
		const spinner = logger.createSpinner(`${c.cyan.bold(label)}`);

		const flowResult = await commonFlow(targetPath, undefined, customDir, label, OperationMode.OnlyTouched, undefined, config, global, options);
		if(flowResult.fails) {
			spinner.fail();

			return flowResult;
		}

		spinner.succeed();
	}

	if(isNonEmptyRecord(global.patches)) {
		const result = await applyPatchFiles(global.patches, targetPath, operationType, config, global, options);
		if(result.fails) {
			return result;
		}
	}

	return OK;
}

async function resolveBranchesForInstalledPackage(dir: string, name: string, version: string, variant: string | undefined, operationMode: OperationMode, setupInstalled: boolean, operationType: OperationType, variants: string[], features: string[], config: InstallConfig, global: Global, options: Options): AsyncDResult<FlowEntry[]> {
	const packageConfig = await readPackageConfig(dir, global.routes, operationType);
	if(packageConfig.fails) {
		logger.fatal(packageConfig.error);
	}

	if(setupInstalled) {
		for(const { name, plan, scope } of packageConfig.value.journeys) {
			if(scope === 'global') {
				global.journeys[name] = plan;
			}
		}

		for(const [name, spec] of Object.entries(packageConfig.value.routes)) {
			if(spec.scope === 'global') {
				global.routes[name] = spec;
			}
		}
	}

	const entry: FlowEntry = {
		config: packageConfig.value,
		dir,
		name,
		operationMode: OperationMode.Default,
		variant,
		version,
	};

	return resolveBranches(entry, variants, features, options);
}
