import rewiremock from 'rewiremock';
// eslint-disable-next-line import/order
import { fs } from '../mocks/fs.js';

rewiremock('fs').with(fs);
rewiremock('fs/promises').with(fs.promises);
rewiremock('npm').with({
	config: {
		get: () => null,
	},
	async load() {
		// do nothing
	},
	log: {},
});
rewiremock('ora').with(() => {
	const ora = {
		fail: () => null,
		start: () => ora,
		succeed: () => null,
	};

	return ora;
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
