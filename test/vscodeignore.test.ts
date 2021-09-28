import { expect } from 'chai';
import { vol } from 'memfs';
import { fixtures } from './utils/fixtures';
import { add } from './rewires/artifact';

describe('vscodeignore', () => {
	const ignoreFxt = fixtures('ignore');
	const packageFxt = fixtures('package');

	beforeEach(async () => { // {{{
		vol.reset();
	}); // }}}

	it('new', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.default.project,
			'/incoming/configs/.vscodeignore': ignoreFxt.default.merged,
			'/incoming/package.json': packageFxt.default.config,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/.vscodeignore', 'utf-8')).to.eql(ignoreFxt.default.merged);
	}); // }}}

	it('merge', async () => { // {{{
		vol.fromJSON({
			'/target/.vscodeignore': ignoreFxt.merge.target,
			'/target/package.json': packageFxt.default.project,
			'/incoming/configs/.vscodeignore': ignoreFxt.merge.incoming,
			'/incoming/package.json': packageFxt.default.config,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/.vscodeignore', 'utf-8')).to.eql(ignoreFxt.merge.merged);
	}); // }}}
});
