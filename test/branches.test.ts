import { expect } from 'chai';
import { vol } from 'memfs';
import { add } from './rewires/artifact';
import { fixtures } from './utils/fixtures';

describe('branches', () => {
	const branchesFxt = fixtures('branches');
	const editorConfigFxt = fixtures('editorconfig');
	const nvmrcFxt = fixtures('nvm');
	const packageFxt = fixtures('package');

	beforeEach(async () => { // {{{
		vol.reset();
	}); // }}}

	it('v14', async () => { // {{{
		vol.fromJSON({
			'/target/.artifactrc.yml': branchesFxt.iconfig.v14,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/branches/[lang-js:14]/configs/.nvmrc': nvmrcFxt.default.v14,
			'/incoming/branches/[lang-js:20]/configs/.nvmrc': nvmrcFxt.default.v20,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/.nvmrc', 'utf-8')).to.eql(nvmrcFxt.default.v14);
	}); // }}}

	it('v20', async () => { // {{{
		vol.fromJSON({
			'/target/.artifactrc.yml': branchesFxt.iconfig.v20,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/branches/[lang-js:14]/configs/.nvmrc': nvmrcFxt.default.v14,
			'/incoming/branches/[lang-js:20]/configs/.nvmrc': nvmrcFxt.default.v20,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/.nvmrc', 'utf-8')).to.eql(nvmrcFxt.default.v20);
	}); // }}}

	it('default', async () => { // {{{
		vol.fromJSON({
			'/target/.artifactrc.yml': branchesFxt.iconfig.default,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/branches/[lang-js:14]/configs/.nvmrc': nvmrcFxt.default.v14,
			'/incoming/branches/[lang-js:20]/configs/.nvmrc': nvmrcFxt.default.v20,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/.nvmrc', 'utf-8')).to.eql(nvmrcFxt.default.v14);
	}); // }}}

	it('both', async () => { // {{{
		vol.fromJSON({
			'/target/.artifactrc.yml': branchesFxt.iconfig.default,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/branches/[lang-js]/configs/.editorconfig': editorConfigFxt.default.space2,
			'/incoming/branches/[lang-js:14]/configs/.nvmrc': nvmrcFxt.default.v14,
			'/incoming/branches/[lang-js:20]/configs/.nvmrc': nvmrcFxt.default.v20,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/.nvmrc', 'utf-8')).to.eql(nvmrcFxt.default.v14);
		expect(vol.readFileSync('/target/.editorconfig', 'utf-8')).to.eql(editorConfigFxt.default.space2);
	}); // }}}
});
