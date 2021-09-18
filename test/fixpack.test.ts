import { expect } from 'chai';
import { vol } from 'memfs';
import { fixtures } from './utils/fixtures';
import { install } from './rewires/install';

describe('fixpack', () => {
	const fixpackFxt = fixtures('fixpack');
	const packageFxt = fixtures('package');

	beforeEach(async () => { // {{{
		vol.reset();
	}); // }}}

	it('rc.json', async () => { // {{{
		vol.fromJSON({
			'/target/.fixpackrc': fixpackFxt.json.target,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/configs/.fixpackrc': fixpackFxt.json.incoming,
		}, '/');

		await install('/target', '/incoming');

		expect(vol.readFileSync('/target/.fixpackrc', 'utf-8')).to.eql(fixpackFxt.json.merged);
	}); // }}}

	it('rc.yaml', async () => { // {{{
		vol.fromJSON({
			'/target/.fixpackrc': fixpackFxt.yaml.target,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/configs/.fixpackrc': fixpackFxt.yaml.incoming,
		}, '/');

		await install('/target', '/incoming');

		expect(vol.readFileSync('/target/.fixpackrc', 'utf-8')).to.eql(fixpackFxt.yaml.merged);
	}); // }}}
});