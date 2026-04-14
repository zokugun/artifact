import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { vol } from 'memfs';
import { add, remove, update } from './rewires/artifact.js';
import { fixtures } from './utils/fixtures.js';

use(chaiAsPromised);

describe('command.always', () => {
	const commandFxt = fixtures('command-always');
	const packageFxt = fixtures('package');

	beforeEach(async () => { // {{{
		vol.reset();
	}); // }}}

	it('add.with-file', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': commandFxt.default.targetPackage,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/.artifactrc': commandFxt.default.incomingArtifactrc,
			'/incoming/configs/package.json': commandFxt.default.incomingPackage,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/package.json', 'utf8')).to.eql(commandFxt.default.mergedPackage);
	}); // }}}

	it('add.no-file', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': commandFxt.default.targetPackage,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/.artifactrc': commandFxt.default.incomingArtifactrc,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/package.json', 'utf8')).to.eql(commandFxt.default.mergedPackage);
	}); // }}}

	it('update.with-file', async () => { // {{{
		vol.fromJSON({
			'/target/.artifactrc': commandFxt.default.targetArtifactrc,
			'/target/package.json': commandFxt.default.targetPackage,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/.artifactrc': commandFxt.default.incomingArtifactrc,
			'/incoming/configs/package.json': commandFxt.default.incomingPackage,
		}, '/');

		await update();

		expect(vol.readFileSync('/target/package.json', 'utf8')).to.eql(commandFxt.default.mergedPackage);
	}); // }}}

	it('update.no-file', async () => { // {{{
		vol.fromJSON({
			'/target/.artifactrc': commandFxt.default.targetArtifactrc,
			'/target/package.json': commandFxt.default.targetPackage,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/.artifactrc': commandFxt.default.incomingArtifactrc,
		}, '/');

		await update();

		expect(vol.readFileSync('/target/package.json', 'utf8')).to.eql(commandFxt.default.mergedPackage);
	}); // }}}

	it('remove.with-file', async () => { // {{{
		vol.fromJSON({
			'/target/.artifactrc': commandFxt.default.targetArtifactrc,
			'/target/package.json': commandFxt.default.targetPackage,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/.artifactrc': commandFxt.default.incomingArtifactrc,
			'/incoming/configs/package.json': commandFxt.default.incomingPackage,
		}, '/');

		await remove(['awesome-config']);

		expect(vol.readFileSync('/target/package.json', 'utf8')).to.eql(commandFxt.default.mergedPackage);
	}); // }}}

	it('remove.no-file', async () => { // {{{
		vol.fromJSON({
			'/target/.artifactrc': commandFxt.default.targetArtifactrc,
			'/target/package.json': commandFxt.default.targetPackage,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/.artifactrc': commandFxt.default.incomingArtifactrc,
		}, '/');

		await remove(['awesome-config']);

		expect(vol.readFileSync('/target/package.json', 'utf8')).to.eql(commandFxt.default.mergedPackage);
	}); // }}}
});
