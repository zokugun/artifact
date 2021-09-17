import rewiremock from 'rewiremock';
import { fs } from '../mocks/fs';

rewiremock('fs').with(fs);
rewiremock('fs/promises').with(fs.promises);

// unload to it can use mocked's fs
const name = require.resolve('fast-glob/out/settings.js');
delete require.cache[name];

rewiremock.enable();

/* eslint-disable import/first */
import { install } from '../../src/install';
/* eslint-enable import/first */

rewiremock.disable();

export {
	install,
};
