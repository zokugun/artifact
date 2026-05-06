import { logger } from '@zokugun/cli-utils';
import { type Spinner } from '@zokugun/cli-utils/logger';
import pacote from 'pacote';
import tempy from 'tempy';

export async function loadPackage(spec: string, spinner: Spinner, options: { force?: boolean; skip?: boolean; verbose?: boolean }): Promise<string | null> {
	const dir = tempy.directory();
	const pkgResult = await pacote.extract(spec, dir);

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

	return dir;
}
