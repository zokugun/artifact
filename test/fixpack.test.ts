import { expect } from 'chai';
import { vol } from 'memfs';
import { fixtures } from './utils/fixtures';
import { add } from './rewires/artifact';

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

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/.fixpackrc', 'utf-8')).to.eql(fixpackFxt.json.merged);
	}); // }}}

	it('rc.yaml', async () => { // {{{
		vol.fromJSON({
			'/target/.fixpackrc': fixpackFxt.yaml.target,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/configs/.fixpackrc': fixpackFxt.yaml.incoming,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/.fixpackrc', 'utf-8')).to.eql(fixpackFxt.yaml.merged);
	}); // }}}

	it('sort', async () => { // {{{
		vol.fromJSON({
			'/target/.fixpackrc': fixpackFxt.sort.target,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/configs/.fixpackrc': fixpackFxt.sort.incoming,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/.fixpackrc', 'utf-8')).to.eql(fixpackFxt.sort.merged);
	}); // }}}
});
