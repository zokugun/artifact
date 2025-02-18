import { expect } from 'chai';
import { vol } from 'memfs';
import { add } from './rewires/artifact';
import { fixtures } from './utils/fixtures';

describe('license', () => {
	const licenseFxt = fixtures('license');
	const packageFxt = fixtures('package');

	beforeEach(async () => { // {{{
		vol.reset();
	}); // }}}

	it('template', async () => { // {{{
		vol.fromJSON({
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/configs/LICENSE': licenseFxt.template.incoming,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/LICENSE', 'utf-8')).to.eql(licenseFxt.template.merged);
	}); // }}}
});
