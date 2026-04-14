import { expect } from 'chai';
import { vol } from 'memfs';
import { add, remove, update } from './rewires/artifact.js';
import { fixtures } from './utils/fixtures.js';

describe('transform', () => {
	const packageFxt = fixtures('package');
	const transformFxt = fixtures('transform');

	beforeEach(async () => { // {{{
		vol.reset();
	}); // }}}

	it('add.with-file', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': transformFxt.default.targetPackage,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/.artifactrc': transformFxt.default.incomingArtifactrc,
			'/incoming/configs/package.json': transformFxt.default.incomingPackage,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/package.json', 'utf8')).to.eql(transformFxt.default.mergedPackage);
	}); // }}}

	it('add.no-file', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': transformFxt.default.targetPackage,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/.artifactrc': transformFxt.default.incomingArtifactrc,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/package.json', 'utf8')).to.eql(transformFxt.default.mergedPackage);
	}); // }}}

	it('update.with-file', async () => { // {{{
		vol.fromJSON({
			'/target/.artifactrc': transformFxt.default.targetArtifactrc,
			'/target/package.json': transformFxt.default.targetPackage,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/.artifactrc': transformFxt.default.incomingArtifactrc,
			'/incoming/configs/package.json': transformFxt.default.incomingPackage,
		}, '/');

		await update();

		expect(vol.readFileSync('/target/package.json', 'utf8')).to.eql(transformFxt.default.mergedPackage);
	}); // }}}

	it('update.no-file', async () => { // {{{
		vol.fromJSON({
			'/target/.artifactrc': transformFxt.default.targetArtifactrc,
			'/target/package.json': transformFxt.default.targetPackage,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/.artifactrc': transformFxt.default.incomingArtifactrc,
		}, '/');

		await update();

		expect(vol.readFileSync('/target/package.json', 'utf8')).to.eql(transformFxt.default.mergedPackage);
	}); // }}}

	it('remove.with-file', async () => { // {{{
		vol.fromJSON({
			'/target/.artifactrc': transformFxt.default.targetArtifactrc,
			'/target/package.json': transformFxt.default.targetPackage,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/.artifactrc': transformFxt.default.removeArtifactrc,
			'/incoming/configs/package.json': transformFxt.default.incomingPackage,
		}, '/');

		await remove(['awesome-config']);

		expect(vol.readFileSync('/target/package.json', 'utf8')).to.eql(transformFxt.default.mergedPackage);
	}); // }}}

	it('remove.no-file', async () => { // {{{
		vol.fromJSON({
			'/target/.artifactrc': transformFxt.default.targetArtifactrc,
			'/target/package.json': transformFxt.default.targetPackage,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/.artifactrc': transformFxt.default.removeArtifactrc,
		}, '/');

		await remove(['awesome-config']);

		expect(vol.readFileSync('/target/package.json', 'utf8')).to.eql(transformFxt.default.mergedPackage);
	}); // }}}
});
