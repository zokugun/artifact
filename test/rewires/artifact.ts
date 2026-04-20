import process from 'node:process';
import rewiremock from 'rewiremock';
// eslint-disable-next-line import/order
import { fs } from '../mocks/fs.js';

const DEBUG = process.env.DEBUG === '1' || process.env.DEBUG === 'true' || process.env.DEBUG === 'on';

rewiremock('fs').with(fs);
rewiremock('fs/promises').with(fs.promises);
rewiremock('node:fs').with(fs);
rewiremock('node:fs/promises').with(fs.promises);
rewiremock('npm').with({
	config: {
		get: () => null,
	},
	async load() {
		// do nothing
	},
	log: {},
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
		createSpinner: () => ({
			fail: () => {},
			succeed: () => {},
		}),
		fatal: (message: string) => {
			throw new Error(message);
		},
		finishTimer: () => {},
		print: (message: string) => {
			if(DEBUG) {
				console.log(message);
			}
		},
	},
});
rewiremock('pacote').with({
	extract: () => ({ resolved: true }),
});
rewiremock('process').with({
	cwd: () => '/target',
	env: {},
});
rewiremock('tempy').with({
	directory: () => '/incoming',
});

// unload to it can use mocked's fs
const name = require.resolve('fast-glob/out/settings.js');
delete require.cache[name];

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
