import { expect } from 'chai';
import { vol } from 'memfs';
import { add } from './rewires/artifact';
import { fixtures } from './utils/fixtures';

describe('gitignore', () => {
	const ignoreFxt = fixtures('ignore');
	const packageFxt = fixtures('package');

	beforeEach(async () => { // {{{
		vol.reset();
	}); // }}}

	it('new', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.default.project,
			'/incoming/configs/gitignore': ignoreFxt.default.merged,
			'/incoming/package.json': packageFxt.default.config,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/.gitignore', 'utf-8')).to.eql(ignoreFxt.default.merged);
	}); // }}}

	it('merge', async () => { // {{{
		vol.fromJSON({
			'/target/.gitignore': ignoreFxt.merge.target,
			'/target/package.json': packageFxt.default.project,
			'/incoming/configs/gitignore': ignoreFxt.merge.incoming,
			'/incoming/package.json': packageFxt.default.config,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/.gitignore', 'utf-8')).to.eql(ignoreFxt.merge.merged);
	}); // }}}
});
