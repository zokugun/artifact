import { expect } from 'chai';
import { vol } from 'memfs';
import { fixtures } from './utils/fixtures';
import { install } from './rewires/install';

describe('tsconfig', () => {
	const tsconfigFxt = fixtures('tsconfig');
	const packageFxt = fixtures('package');

	beforeEach(async () => { // {{{
		vol.reset();
	}); // }}}

	it('advanced', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.default.project,
			'/incoming/configs/tsconfig.json': tsconfigFxt.advanced.merged,
			'/incoming/package.json': packageFxt.default.config,
		}, '/');

		await install('/target', '/incoming');

		expect(vol.readFileSync('/target/tsconfig.json', 'utf-8')).to.eql(tsconfigFxt.advanced.merged);
	}); // }}}

	it('basic', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.default.project,
			'/incoming/configs/tsconfig.json': tsconfigFxt.basic.merged,
			'/incoming/package.json': packageFxt.default.config,
		}, '/');

		await install('/target', '/incoming');

		expect(vol.readFileSync('/target/tsconfig.json', 'utf-8')).to.eql(tsconfigFxt.basic.merged);
	}); // }}}

	it('merge', async () => { // {{{
		vol.fromJSON({
			'/target/tsconfig.json': tsconfigFxt.merge.target,
			'/target/package.json': packageFxt.default.project,
			'/incoming/configs/tsconfig.json': tsconfigFxt.merge.incoming,
			'/incoming/package.json': packageFxt.default.config,
		}, '/');

		await install('/target', '/incoming');

		expect(vol.readFileSync('/target/tsconfig.json', 'utf-8')).to.eql(tsconfigFxt.merge.merged);
	}); // }}}
});
