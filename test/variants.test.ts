import { expect } from 'chai';
import { vol } from 'memfs';
import { add } from './rewires/artifact';
import { fixtures } from './utils/fixtures';

describe('variants', () => {
	const editorConfigFxt = fixtures('editorconfig');
	const fixpackFxt = fixtures('fixpack');
	const nvmrcFxt = fixtures('nvm');
	const packageFxt = fixtures('package');
	const variantsFxt = fixtures('variants');

	beforeEach(async () => { // {{{
		vol.reset();
	}); // }}}

	it('root', async () => { // {{{
		vol.fromJSON({
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/.artifactrc.yml': variantsFxt.pconfig.incoming,
			'/incoming/variants/14/configs/.nvmrc': nvmrcFxt.default.v14,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/.artifactrc.yml', 'utf-8')).to.eql(variantsFxt.iconfig.default);
		expect(vol.readFileSync('/target/.nvmrc', 'utf-8')).to.eql(nvmrcFxt.default.v14);
	}); // }}}

	it('root:14', async () => { // {{{
		vol.fromJSON({
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/.artifactrc.yml': variantsFxt.pconfig.incoming,
			'/incoming/variants/14/configs/.nvmrc': nvmrcFxt.default.v14,
		}, '/');

		await add(['awesome-config:14']);

		expect(vol.readFileSync('/target/.artifactrc.yml', 'utf-8')).to.eql(variantsFxt.iconfig.v14);
		expect(vol.readFileSync('/target/.nvmrc', 'utf-8')).to.eql(nvmrcFxt.default.v14);
	}); // }}}

	it('v20-14', async () => { // {{{
		vol.fromJSON({
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/.artifactrc.yml': variantsFxt.pconfig.incoming,
			'/incoming/variants/14/configs/.nvmrc': nvmrcFxt.default.v14,
			'/incoming/variants/14/configs/.fixpackrc': fixpackFxt.yaml.incoming,
			'/incoming/variants/20/configs/.nvmrc': nvmrcFxt.default.v20,
		}, '/');

		await add(['awesome-config:20']);

		expect(vol.readFileSync('/target/.artifactrc.yml', 'utf-8')).to.eql(variantsFxt.iconfig.v20);
		expect(vol.readFileSync('/target/.nvmrc', 'utf-8')).to.eql(nvmrcFxt.default.v20);
		expect(vol.readFileSync('/target/.fixpackrc', 'utf-8')).to.eql(fixpackFxt.yaml.incoming);
	}); // }}}

	it('v20-orphan', async () => { // {{{
		vol.fromJSON({
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/.artifactrc.yml': variantsFxt.pconfig.incoming,
			'/incoming/variants/14/configs/.nvmrc': nvmrcFxt.default.v14,
			'/incoming/variants/14/configs/.fixpackrc': fixpackFxt.yaml.incoming,
			'/incoming/variants/20/.artifactrc.yml': variantsFxt.pconfig.orphan,
			'/incoming/variants/20/configs/.nvmrc': nvmrcFxt.default.v20,
		}, '/');

		await add(['awesome-config:20']);

		expect(vol.readFileSync('/target/.artifactrc.yml', 'utf-8')).to.eql(variantsFxt.iconfig.v20);
		expect(vol.readFileSync('/target/.nvmrc', 'utf-8')).to.eql(nvmrcFxt.default.v20);
		expect(vol.existsSync('/target/.fixpackrc')).to.eql(false);
	}); // }}}

	it('v20-extends-14', async () => { // {{{
		vol.fromJSON({
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/.artifactrc.yml': variantsFxt.pconfig.incoming,
			'/incoming/variants/14/configs/.nvmrc': nvmrcFxt.default.v14,
			'/incoming/variants/14/configs/.fixpackrc': fixpackFxt.yaml.incoming,
			'/incoming/variants/20/.artifactrc.yml': variantsFxt.pconfig.extends14,
			'/incoming/variants/20/configs/.nvmrc': nvmrcFxt.default.v20,
		}, '/');

		await add(['awesome-config:20']);

		expect(vol.readFileSync('/target/.artifactrc.yml', 'utf-8')).to.eql(variantsFxt.iconfig.e20);
		expect(vol.readFileSync('/target/.nvmrc', 'utf-8')).to.eql(nvmrcFxt.default.v20);
		expect(vol.readFileSync('/target/.fixpackrc', 'utf-8')).to.eql(fixpackFxt.yaml.incoming);
	}); // }}}

	it('v20-extends-root', async () => { // {{{
		vol.fromJSON({
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/.artifactrc.yml': variantsFxt.pconfig.incoming,
			'/incoming/variants/14/configs/.nvmrc': nvmrcFxt.default.v14,
			'/incoming/variants/14/configs/.fixpackrc': fixpackFxt.yaml.incoming,
			'/incoming/variants/20/.artifactrc.yml': variantsFxt.pconfig.extendsRoot,
			'/incoming/variants/20/configs/.nvmrc': nvmrcFxt.default.v20,
		}, '/');

		await add(['awesome-config:20']);

		expect(vol.readFileSync('/target/.artifactrc.yml', 'utf-8')).to.eql(variantsFxt.iconfig.e20);
		expect(vol.readFileSync('/target/.nvmrc', 'utf-8')).to.eql(nvmrcFxt.default.v20);
		expect(vol.readFileSync('/target/.fixpackrc', 'utf-8')).to.eql(fixpackFxt.yaml.incoming);
	}); // }}}

	it('v24-extends-v20', async () => { // {{{
		vol.fromJSON({
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/.artifactrc.yml': variantsFxt.pconfig.incoming,
			'/incoming/variants/14/configs/.nvmrc': nvmrcFxt.default.v14,
			'/incoming/variants/14/configs/.fixpackrc': fixpackFxt.yaml.incoming,
			'/incoming/variants/20/.artifactrc.yml': variantsFxt.pconfig.extendsRoot,
			'/incoming/variants/20/configs/.nvmrc': nvmrcFxt.default.v20,
			'/incoming/variants/20/configs/.editorconfig': editorConfigFxt.yaml.tab,
			'/incoming/variants/24/.artifactrc.yml': variantsFxt.pconfig.extends20,
			'/incoming/variants/24/configs/.nvmrc': nvmrcFxt.default.v24,
		}, '/');

		await add(['awesome-config:24']);

		expect(vol.readFileSync('/target/.artifactrc.yml', 'utf-8')).to.eql(variantsFxt.iconfig.e24);
		expect(vol.readFileSync('/target/.nvmrc', 'utf-8')).to.eql(nvmrcFxt.default.v24);
		expect(vol.readFileSync('/target/.fixpackrc', 'utf-8')).to.eql(fixpackFxt.yaml.incoming);
		expect(vol.readFileSync('/target/.editorconfig', 'utf-8')).to.eql(editorConfigFxt.yaml.tab);
	}); // }}}
});
