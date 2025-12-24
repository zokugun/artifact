import { expect } from 'chai';
import { vol } from 'memfs';
import { add } from './rewires/artifact';
import { fixtures } from './utils/fixtures';

describe('nvm', () => {
	const nvmrcFxt = fixtures('nvm');
	const packageFxt = fixtures('package');

	beforeEach(async () => { // {{{
		vol.reset();
	}); // }}}

	it('default', async () => { // {{{
		vol.fromJSON({
			'/target/.nvmrc': nvmrcFxt.default.v12,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/configs/.nvmrc': nvmrcFxt.default.v14,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/.nvmrc', 'utf-8')).to.eql(nvmrcFxt.default.v14);
	}); // }}}
});
