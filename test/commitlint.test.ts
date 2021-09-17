import { expect } from 'chai';
import { vol } from 'memfs';
import { fixtures } from './utils/fixtures';
import { install } from './rewires/install';

describe('commitlint', () => {
	const commitlintFxt = fixtures('commitlint');
	const packageFxt = fixtures('package');

	beforeEach(async () => { // {{{
		vol.reset();
	}); // }}}

	it('json', async () => { // {{{
		vol.fromJSON({
			'/target/.commitlintrc.json': commitlintFxt.json.target,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/configs/.commitlintrc.json': commitlintFxt.json.incoming,
		}, '/');

		await install('/target', '/incoming');

		expect(vol.readFileSync('/target/.commitlintrc.json', 'utf-8')).to.eql(commitlintFxt.json.merged);
	}); // }}}

	it('rc.json', async () => { // {{{
		vol.fromJSON({
			'/target/.commitlintrc': commitlintFxt.json.target,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/configs/.commitlintrc': commitlintFxt.json.incoming,
		}, '/');

		await install('/target', '/incoming');

		expect(vol.readFileSync('/target/.commitlintrc', 'utf-8')).to.eql(commitlintFxt.json.merged);
	}); // }}}

	it('rc.yaml', async () => { // {{{
		vol.fromJSON({
			'/target/.commitlintrc': commitlintFxt.yaml.target,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/configs/.commitlintrc': commitlintFxt.yaml.incoming,
		}, '/');

		await install('/target', '/incoming');

		expect(vol.readFileSync('/target/.commitlintrc', 'utf-8')).to.eql(commitlintFxt.yaml.merged);
	}); // }}}

	it('yaml', async () => { // {{{
		vol.fromJSON({
			'/target/.commitlintrc.yaml': commitlintFxt.yaml.target,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/configs/.commitlintrc.yaml': commitlintFxt.yaml.incoming,
		}, '/');

		await install('/target', '/incoming');

		expect(vol.readFileSync('/target/.commitlintrc.yaml', 'utf-8')).to.eql(commitlintFxt.yaml.merged);
	}); // }}}

	it('yml', async () => { // {{{
		vol.fromJSON({
			'/target/.commitlintrc.yml': commitlintFxt.yaml.target,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/configs/.commitlintrc.yml': commitlintFxt.yaml.incoming,
		}, '/');

		await install('/target', '/incoming');

		expect(vol.readFileSync('/target/.commitlintrc.yml', 'utf-8')).to.eql(commitlintFxt.yaml.merged);
	}); // }}}
});
