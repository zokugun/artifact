import rewiremock from 'rewiremock';
import { fs } from '../mocks/fs';

rewiremock('fs').with(fs);
rewiremock('fs/promises').with(fs.promises);
rewiremock('npm').with({
	config: {
		get: () => null,
	},
	load: async () => {
		// do nothing
	},
});
rewiremock('pacote').with({
	extract: () => ({ resolved: true }),
});
rewiremock('process').with({
	env: {
		INIT_CWD: '/target',
	},
});
rewiremock('tempy').with({
	directory: () => '/incoming',
});

// unload to it can use mocked's fs
const name = require.resolve('fast-glob/out/settings.js');
delete require.cache[name];

rewiremock.enable();

/* eslint-disable import/first */
import { add } from '../../src/commands/add';
import { update } from '../../src/commands/update';
/* eslint-enable import/first */

rewiremock.disable();

export {
	add,
	update,
};
