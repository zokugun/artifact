import { logger } from '@zokugun/cli-utils';
import { type Spinner } from '@zokugun/cli-utils/logger';
import fse from '@zokugun/fs-extra-plus/async';
import pacote from 'pacote';

export type LoadPackageOptions = {
	before?: Date;
	force?: boolean;
	skip?: boolean;
	verbose?: boolean;
};

const $cache = new Map<string, string | null>();

export async function loadPackage(spec: string, spinner: Spinner | undefined, options: LoadPackageOptions): Promise<string | null> {
	if($cache.has(spec)) {
		return $cache.get(spec) as string | null;
	}

	const dir = await fse.makeTempDir();
	if(dir.fails) {
		logger.fatal('Cannot generate temporary directory');
	}

	const pkgResult = await pacote.extract(spec, dir.value, { before: options.before });

	if(!pkgResult.resolved) {
		if(options.force || options.skip) {
			spinner?.fail();

			if(options.verbose) {
				logger.warn(`The artifact '${spec}' couldn't be found, skipping...`);
			}

			$cache.set(spec, null);

			return null;
		}
		else {
			logger.fatal(pkgResult.from);
		}
	}

	$cache.set(spec, dir.value);

	return dir.value;
}
