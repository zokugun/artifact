import { expect } from 'chai';
import { vol } from 'memfs';
import { fixtures } from './utils/fixtures';
import { install } from './rewires/install';

describe('json', () => {
	const editorConfigFxt = fixtures('editorconfig');
	const jsonFxt = fixtures('json');
	const packageFxt = fixtures('package');

	beforeEach(async () => { // {{{
		vol.reset();
	}); // }}}

	it('format.default.space', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.default.project,
			'/incoming/configs/default.json': jsonFxt.format.space2,
			'/incoming/package.json': packageFxt.default.config,
		}, '/');

		await install('/target', '/incoming');

		expect(vol.readFileSync('/target/default.json', 'utf-8')).to.eql(jsonFxt.format.tab);
	}); // }}}

	it('format.default.tab', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.default.project,
			'/incoming/configs/default.json': jsonFxt.format.tab,
			'/incoming/package.json': packageFxt.default.config,
		}, '/');

		await install('/target', '/incoming');

		expect(vol.readFileSync('/target/default.json', 'utf-8')).to.eql(jsonFxt.format.tab);
	}); // }}}

	it('format.space22tab.incoming', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.default.project,
			'/incoming/configs/.editorconfig': editorConfigFxt.default.tab,
			'/incoming/configs/default.json': jsonFxt.format.space2,
			'/incoming/package.json': packageFxt.default.config,
		}, '/');

		await install('/target', '/incoming');

		expect(vol.readFileSync('/target/default.json', 'utf-8')).to.eql(jsonFxt.format.tab);
	}); // }}}

	it('format.space22tab.target', async () => { // {{{
		vol.fromJSON({
			'/target/.editorconfig': editorConfigFxt.default.tab,
			'/target/package.json': packageFxt.default.project,
			'/incoming/configs/default.json': jsonFxt.format.space2,
			'/incoming/package.json': packageFxt.default.config,
		}, '/');

		await install('/target', '/incoming');

		expect(vol.readFileSync('/target/default.json', 'utf-8')).to.eql(jsonFxt.format.tab);
	}); // }}}

	it('merge', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.default.project,
			'/target/default.json': jsonFxt.merge.target,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/configs/default.json': jsonFxt.merge.incoming,
		}, '/');

		await install('/target', '/incoming');

		expect(vol.readFileSync('/target/default.json', 'utf-8')).to.eql(jsonFxt.merge.merged);
	}); // }}}
});
