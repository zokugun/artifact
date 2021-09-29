import { expect } from 'chai';
import { vol } from 'memfs';
import { fixtures } from './utils/fixtures';
import { add } from './rewires/artifact';

describe('tsconfig', () => {
	const tsconfigFxt = fixtures('tsconfig');
	const packageFxt = fixtures('package');

	beforeEach(async () => { // {{{
		vol.reset();
	}); // }}}

	it('add.advanced', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.default.project,
			'/incoming/configs/tsconfig.json': tsconfigFxt.addAdvanced.merged,
			'/incoming/package.json': packageFxt.default.config,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/tsconfig.json', 'utf-8')).to.eql(tsconfigFxt.addAdvanced.merged);
	}); // }}}

	it('add.basic', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.default.project,
			'/incoming/configs/tsconfig.json': tsconfigFxt.addBasic.merged,
			'/incoming/package.json': packageFxt.default.config,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/tsconfig.json', 'utf-8')).to.eql(tsconfigFxt.addBasic.merged);
	}); // }}}

	it('merge.basic', async () => { // {{{
		vol.fromJSON({
			'/target/tsconfig.json': tsconfigFxt.mergeBasic.target,
			'/target/package.json': packageFxt.default.project,
			'/incoming/configs/tsconfig.json': tsconfigFxt.mergeBasic.incoming,
			'/incoming/package.json': packageFxt.default.config,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/tsconfig.json', 'utf-8')).to.eql(tsconfigFxt.mergeBasic.merged);
	}); // }}}

	it('merge.dom', async () => { // {{{
		vol.fromJSON({
			'/target/tsconfig.json': tsconfigFxt.mergeDom.target,
			'/target/package.json': packageFxt.default.project,
			'/incoming/configs/tsconfig.json': tsconfigFxt.mergeDom.incoming,
			'/incoming/package.json': packageFxt.default.config,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/tsconfig.json', 'utf-8')).to.eql(tsconfigFxt.mergeDom.merged);
	}); // }}}
});
