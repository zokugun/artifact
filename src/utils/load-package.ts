import { logger } from '@zokugun/cli-utils';
import { type Spinner } from '@zokugun/cli-utils/logger';
import fse from '@zokugun/fs-extra-plus/async';
import pacote from 'pacote';

export async function loadPackage(spec: string, spinner: Spinner, options: { before?: Date; force?: boolean; skip?: boolean; verbose?: boolean }): Promise<string | null> {
	const dir = await fse.makeTempDir();
	if(dir.fails) {
		logger.fatal('Cannot generate temporary directory');
	}

	const pkgResult = await pacote.extract(spec, dir.value, { before: options.before });

	if(!pkgResult.resolved) {
		if(options.force || options.skip) {
			spinner.fail();

			if(options.verbose) {
				logger.warn(`The artifact '${spec}' couldn't be found, skipping...`);
			}

			return null;
		}
		else {
			logger.fatal(pkgResult.from);
		}
	}

	return dir.value;
}
