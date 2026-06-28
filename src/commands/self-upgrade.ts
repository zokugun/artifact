import { spawn } from 'node:child_process';
import { c, logger } from '@zokugun/cli-utils';
import { stringifyError } from '@zokugun/xtry';
import { detect, resolveCommand } from 'package-manager-detector';
import pacote from 'pacote';
import { gt } from 'semver';
import pkg from '../../package.json' with { type: 'json' };

export async function selfUpgrade(inputOptions: { minReleaseAge?: number } = {}): Promise<void> {
	logger.beginTimer();

	const { name } = pkg;
	const installed = pkg.version;
	const minAgeHours = inputOptions.minReleaseAge ?? 48;

	logger.newLine();
	logger.info(`min-release-age: ${minAgeHours}h`);
	logger.newLine();

	const before = new Date(Date.now() - (minAgeHours * 3_600_000));

	try {
		const manifest = await pacote.manifest(name, { fullMetadata: true, before });
		const latest = manifest.version;

		if(!gt(latest, installed)) {
			logger.success('Already up-to-date.');
			logger.finishTimer();
			return;
		}

		const spinner = logger.createSpinner(`Upgrading ${c.cyan.bold(name)} ${c.grey(installed)} → ${c.green(latest)}`);

		const pm = await detect();
		if(!pm) {
			logger.fatal('Could not detect package manager');
		}

		const resolvedCommand = resolveCommand(pm.agent, 'global', [`${name}@${latest}`]);
		if(!resolvedCommand) {
			logger.fatal('Could not resolve install/add command');
		}

		const { command, args } = resolvedCommand;

		const child = spawn(command, args, { stdio: 'inherit' });

		await new Promise<void>((resolve, reject) => {
			child.on('error', (err) => reject(err));
			child.on('close', (code) => {
				if(code === 0) {
					resolve();
				}
				else {
					reject(new Error(`${command} exited with code ${code}`));
				}
			});
		});

		spinner.succeed();

		logger.success(`Upgrade complete: ${installed} → ${latest}`);

		logger.finishTimer();
	}
	catch (error) {
		logger.fatal(stringifyError(error as Error));
	}
}
