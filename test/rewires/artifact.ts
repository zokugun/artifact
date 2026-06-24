import process from 'node:process';
// import { ok } from '@zokugun/xtry';
import rewiremock from 'rewiremock';
// eslint-disable-next-line import/order
import { fs } from '../mocks/fs.js';

const DEBUG = process.env.DEBUG === '1' || process.env.DEBUG === 'true' || process.env.DEBUG === 'on';

rewiremock('fs').with(fs);
rewiremock('fs/promises').with(fs.promises);
rewiremock('node:fs').with(fs);
rewiremock('node:fs/promises').with(fs.promises);
rewiremock('node:process').with({
	cwd: () => '/target',
	env: {},
});
rewiremock('npm').with({
	config: {
		get: () => null,
	},
	async load() {
		// do nothing
	},
	log: {},
});
rewiremock('pacote').with({
	extract: () => ({ resolved: true }),
});
rewiremock('@zokugun/cli-utils').with({
	c: {
		bgBlue: (value: string) => value,
		cyan: {
			bold: (value: string) => value,
		},
	},
	logger: {
		beginTimer: () => {},
		debug: (message: string) => {
			if(DEBUG) {
				console.log(message);
			}
		},
		createSpinner: (message: string) => {
			if(DEBUG) {
				console.log(message);
			}

			return {
				fail: () => {},
				succeed: () => {},
			};
		},
		fatal: (message: string) => {
			throw new Error(message);
		},
		finishTimer: () => {},
		info: () => {},
		newLine: () => {},
		print: (message: string) => {
			if(DEBUG) {
				console.log(message);
			}
		},
	},
});
rewiremock('../utils/load-package.js').with({
	loadPackage: (spec: string) => {
		const index = spec.lastIndexOf('@');

		if(index === -1) {
			return `/registry/${spec}`;
		}
		else {
			return `/registry/${spec.slice(0, index)}`;
		}
	},
});

rewiremock.enable();

/* eslint-disable import/first */
import { add } from '../../src/commands/add.js';
import { remove } from '../../src/commands/remove.js';
import { update } from '../../src/commands/update.js';
/* eslint-enable import/first */

rewiremock.disable();

/* eslint-disable unicorn/prefer-export-from */
export {
	add,
	remove,
	update,
};
/* eslint-enable unicorn/prefer-export-from */
