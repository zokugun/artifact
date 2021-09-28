import { expect } from 'chai';
import { vol } from 'memfs';
import { fixtures } from './utils/fixtures';
import { add } from './rewires/artifact';

describe('package', () => {
	const packageFxt = fixtures('package');

	beforeEach(async () => { // {{{
		vol.reset();
	}); // }}}

	it('command.complex', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.commandComplex.target,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/configs/package.json': packageFxt.commandComplex.incoming,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/package.json', 'utf-8')).to.eql(packageFxt.commandComplex.merged);
	}); // }}}

	it('dependencies', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.dependencies.target,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/configs/package.json': packageFxt.dependencies.incoming,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/package.json', 'utf-8')).to.eql(packageFxt.dependencies.merged);
	}); // }}}

	it('homepage', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.homepage.target,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/configs/package.json': packageFxt.homepage.incoming,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/package.json', 'utf-8')).to.eql(packageFxt.homepage.merged);
	}); // }}}

	it('keywords', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.keywords.target,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/configs/package.json': packageFxt.keywords.incoming,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/package.json', 'utf-8')).to.eql(packageFxt.keywords.merged);
	}); // }}}

	it('license.object', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.licenseObject.target,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/configs/package.json': packageFxt.licenseObject.incoming,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/package.json', 'utf-8')).to.eql(packageFxt.licenseObject.merged);
	}); // }}}

	it('license.string', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.licenseString.target,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/configs/package.json': packageFxt.licenseString.incoming,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/package.json', 'utf-8')).to.eql(packageFxt.licenseString.merged);
	}); // }}}

	it('name', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.name.target,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/configs/package.json': packageFxt.name.incoming,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/package.json', 'utf-8')).to.eql(packageFxt.name.merged);
	}); // }}}

	it('none', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.none.target,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/configs/package.json': packageFxt.none.incoming,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/package.json', 'utf-8')).to.eql(packageFxt.none.merged);
	}); // }}}
});
