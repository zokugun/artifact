import { expect } from 'chai';
import { vol } from 'memfs';
import { fixtures } from './utils/fixtures';
import { install } from './rewires/install';

describe('nvm', () => {
	const nvmrcFxt = fixtures('nvm');
	const packageFxt = fixtures('package');

	beforeEach(async () => { // {{{
		vol.reset();
	}); // }}}

	it('default', async () => { // {{{
		vol.fromJSON({
			'/target/.nvmrc': nvmrcFxt.default.target,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/configs/.nvmrc': nvmrcFxt.default.incoming,
		}, '/');

		await install('/target', '/incoming');

		expect(vol.readFileSync('/target/.nvmrc', 'utf-8')).to.eql(nvmrcFxt.default.incoming);
	}); // }}}
});
