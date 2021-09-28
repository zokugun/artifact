import { expect } from 'chai';
import { vol } from 'memfs';
import { fixtures } from './utils/fixtures';
import { add } from './rewires/artifact';

describe('editorconfig', () => {
	const editorConfigFxt = fixtures('editorconfig');
	const packageFxt = fixtures('package');

	beforeEach(async () => { // {{{
		vol.reset();
	}); // }}}

	it('new', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.default.project,
			'/incoming/configs/.editorconfig': editorConfigFxt.default.space2,
			'/incoming/package.json': packageFxt.default.config,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/.editorconfig', 'utf-8')).to.eql(editorConfigFxt.default.space2);
	}); // }}}

	it('overwrite', async () => { // {{{
		vol.fromJSON({
			'/target/.editorconfig': editorConfigFxt.default.space2,
			'/target/package.json': packageFxt.default.project,
			'/incoming/configs/.editorconfig': editorConfigFxt.yaml.tab,
			'/incoming/package.json': packageFxt.default.config,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/.editorconfig', 'utf-8')).to.eql(editorConfigFxt.yaml.tab);
	}); // }}}
});
