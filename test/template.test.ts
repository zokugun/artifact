import { expect } from 'chai';
import { vol } from 'memfs';
import { add } from './rewires/artifact.js';
import { fixtures } from './utils/fixtures.js';

describe('template', () => {
	const templateFxt = fixtures('template');
	const packageFxt = fixtures('package');

	beforeEach(async () => { // {{{
		vol.reset();
	}); // }}}

	it('license', async () => { // {{{
		vol.fromJSON({
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/configs/LICENSE': templateFxt.license.incoming,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/LICENSE', 'utf8')).to.eql(templateFxt.license.merged);
	}); // }}}

	it('package.name', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.templateName.target,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/configs/package.json': packageFxt.templateName.incoming,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/package.json', 'utf8')).to.eql(packageFxt.templateName.merged);
	}); // }}}

	it('vars.artifact-noscope', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': templateFxt.varsArtifactNoscope.project,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/.artifactrc.yml': templateFxt.varsArtifactNoscope.config,
			'/incoming/configs/package.json': templateFxt.varsArtifactNoscope.incoming,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/package.json', 'utf8')).to.eql(templateFxt.varsArtifactNoscope.merged);
	}); // }}}

	it('vars.artifact-scoped', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': templateFxt.varsArtifactScoped.project,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/.artifactrc.yml': templateFxt.varsArtifactScoped.config,
			'/incoming/configs/package.json': templateFxt.varsArtifactScoped.incoming,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/package.json', 'utf8')).to.eql(templateFxt.varsArtifactScoped.merged);
	}); // }}}

	it('vars.project', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': templateFxt.varsProject.project,
			'/target/.artifactrc.yml': templateFxt.varsProject.configProject,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/.artifactrc.yml': templateFxt.varsProject.configArtifact,
			'/incoming/configs/package.json': templateFxt.varsProject.incoming,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/package.json', 'utf8')).to.eql(templateFxt.varsProject.merged);
	}); // }}}
});
