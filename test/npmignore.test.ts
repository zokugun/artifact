import { expect } from 'chai';
import { vol } from 'memfs';
import { fixtures } from './utils/fixtures';
import { install } from './rewires/install';

describe('npmignore', () => {
	const ignoreFxt = fixtures('ignore');
	const packageFxt = fixtures('package');

	beforeEach(async () => { // {{{
		vol.reset();
	}); // }}}

	it('new', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.default.project,
			'/incoming/configs/npmignore': ignoreFxt.default.merged,
			'/incoming/package.json': packageFxt.default.config,
		}, '/');

		await install('/target', '/incoming');

		expect(vol.readFileSync('/target/.npmignore', 'utf-8')).to.eql(ignoreFxt.default.merged);
	}); // }}}

	it('merge', async () => { // {{{
		vol.fromJSON({
			'/target/.npmignore': ignoreFxt.merge.target,
			'/target/package.json': packageFxt.default.project,
			'/incoming/configs/npmignore': ignoreFxt.merge.incoming,
			'/incoming/package.json': packageFxt.default.config,
		}, '/');

		await install('/target', '/incoming');

		expect(vol.readFileSync('/target/.npmignore', 'utf-8')).to.eql(ignoreFxt.merge.merged);
	}); // }}}
});
