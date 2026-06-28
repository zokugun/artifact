import { c, logger } from '@zokugun/cli-utils';
import { stringifyError } from '@zokugun/xtry';
import pacote from 'pacote';
import { gt } from 'semver';
import pkg from '../../package.json' with { type: 'json' };

export async function version(): Promise<void> {
	const { name } = pkg;
	const installed = pkg.version;

	try {
		const manifest = await pacote.manifest(name, { fullMetadata: true });
		const latest = manifest.version;

		logger.newLine();

		const upgradeAvailable = gt(latest, installed);

		if(upgradeAvailable) {
			logger.warn(`An upgrade is available (${c.grey(installed)} → ${c.green(latest)}). Run ${c.cyan.bold('artifact self-upgrade')} to upgrade.`);
		}
		else {
			logger.success(`You are using the latest version (${c.green(installed)}).`);
		}

		logger.newLine();
	}
	catch (error) {
		logger.fatal(stringifyError(error));
	}
}
