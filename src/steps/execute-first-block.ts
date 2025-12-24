import path from 'node:path';
import { isNil } from 'lodash';
import { readPackageConfig } from '../configs';
import { Context } from '../types/context';

export async function executeFirstBlock(context: Context): Promise<boolean | void> {
	const { name, version } = context.incomingPackage!;
	const root = String(context.incomingConfig!.variants?.root ?? '');

	if(context.incomingVariant) {
		let variant: string;
		let alias: boolean;

		if(isNil(context.incomingConfig!.variants![context.incomingVariant])) {
			variant = context.incomingVariant;
			alias = false;
		}
		else {
			variant = String(context.incomingConfig!.variants![context.incomingVariant]);
			alias = true;
		}

		const variantPath = path.join(context.packagePath, 'variants', variant);
		const variantConfig = await readPackageConfig(variantPath);

		if(variantConfig.orphan) {
			pushToResult(name, version, variant, alias, context);

			context.incomingConfig = variantConfig;

			await context.commonFlow(name, version, variant, undefined, variantPath, context);
		}
		else if(variantConfig.extends) {
			context.blocks.unshift({
				name,
				version,
				variant,
				incomingPath: path.join(context.packagePath, 'variants', variant),
			});

			pushToResult(name, version, variant, alias, context);

			const extend = String(context.incomingConfig!.variants![variantConfig.extends] ?? variantConfig.extends);

			context.incomingVariant = extend;

			return executeFirstBlock(context);
		}
		else {
			if(root.length === 0) {
				throw new Error('No root variant has been defined');
			}

			if(root === variant) {
				pushToResult(name, version, variant, alias, context);

				context.incomingConfig = variantConfig;

				await context.commonFlow(name, version, variant, undefined, variantPath, context);
			}
			else {
				const variant = String(context.incomingConfig!.variants![context.request.variant!] ?? context.request.variant);

				context.blocks.unshift({
					name,
					version,
					variant,
					incomingPath: path.join(context.packagePath, 'variants', variant),
				});

				pushToResult(name, version, variant, alias, context);

				const incomingPath = path.join(context.packagePath, 'variants', root);

				context.incomingConfig = undefined;

				await context.commonFlow(name, version, root, undefined, incomingPath, context);
			}
		}
	}
	else if(root.length > 0) {
		context.result = {
			name,
			version,
			provides: [root],
		};

		const incomingPath = path.join(context.packagePath, 'variants', root);

		context.incomingConfig = undefined;

		await context.commonFlow(name, version, root, undefined, incomingPath, context);
	}
	else {
		context.result = { name, version };

		await context.commonFlow(name, version, undefined, undefined, context.incomingPath, context);
	}
}

function pushToResult(name: string, version: string, variant: string, alias: boolean, context: Context): void {
	context.result ??= {
		name,
		version,
		requires: [context.request.variant!],
	};

	const provider = context.incomingVariant !== context.request.variant;

	if(provider || alias) {
		context.result.provides ??= [];

		if(provider) {
			context.result.provides.unshift(context.incomingVariant!);
		}

		if(alias) {
			context.result.provides.unshift(variant);
		}
	}
}
