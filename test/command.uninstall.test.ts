import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { vol } from 'memfs';
import { remove } from './rewires/artifact.js';
import { fixtures } from './utils/fixtures.js';

use(chaiAsPromised);

describe('command.uninstall', () => {
	const commandFxt = fixtures('command-uninstall');
	const packageFxt = fixtures('package');

	beforeEach(async () => { // {{{
		vol.reset();
	}); // }}}

	it('remove.all.no', async () => { // {{{
		vol.fromJSON({
			'/target/.artifactrc': commandFxt.removeAll.targetArtifactrc,
			'/target/package.json': packageFxt.default.project,
			'/target/src/index2.ts': commandFxt.removeAll.targetSrc,
			'/incoming/.artifactrc': commandFxt.removeAll.incomingArtifactrc,
			'/incoming/package.json': commandFxt.removeAll.incomingPackage,
		}, '/');

		await remove(['awesome-config']);

		expect(vol.readFileSync('/target/.artifactrc', 'utf8')).to.eql(commandFxt.removeAll.mergedArtifactrc);
		await expect(vol.promises.readFile('/target/src/index.ts', 'utf8')).to.be.rejectedWith('ENOENT: no such file or directory, open \'/target/src/index.ts\'');
		await expect(vol.promises.readFile('/target/src/index2.ts', 'utf8')).to.be.rejectedWith('ENOENT: no such file or directory, open \'/target/src/index2.ts\'');
	}); // }}}

	it('remove.all.yes', async () => { // {{{
		vol.fromJSON({
			'/target/.artifactrc': commandFxt.removeAll.targetArtifactrc,
			'/target/package.json': packageFxt.default.project,
			'/target/src/index.ts': commandFxt.removeAll.targetSrc,
			'/target/src/index2.ts': commandFxt.removeAll.targetSrc,
			'/incoming/.artifactrc': commandFxt.removeAll.incomingArtifactrc,
			'/incoming/package.json': commandFxt.removeAll.incomingPackage,
		}, '/');

		await remove(['awesome-config']);

		expect(vol.readFileSync('/target/.artifactrc', 'utf8')).to.eql(commandFxt.removeAll.mergedArtifactrc);
		await expect(vol.promises.readFile('/target/src/index.ts', 'utf8')).to.be.rejectedWith('ENOENT: no such file or directory, open \'/target/src/index.ts\'');
		await expect(vol.promises.readFile('/target/src/index2.ts', 'utf8')).to.be.rejectedWith('ENOENT: no such file or directory, open \'/target/src/index2.ts\'');
	}); // }}}

	it('remove.index.no', async () => { // {{{
		vol.fromJSON({
			'/target/.artifactrc': commandFxt.removeIndex.targetArtifactrc,
			'/target/package.json': packageFxt.default.project,
			'/target/src/index2.ts': commandFxt.removeIndex.targetSrc,
			'/incoming/.artifactrc': commandFxt.removeIndex.incomingArtifactrc,
			'/incoming/package.json': commandFxt.removeIndex.incomingPackage,
		}, '/');

		await remove(['awesome-config']);

		expect(vol.readFileSync('/target/.artifactrc', 'utf8')).to.eql(commandFxt.removeIndex.mergedArtifactrc);
		await expect(vol.promises.readFile('/target/src/index.ts', 'utf8')).to.be.rejectedWith('ENOENT: no such file or directory, open \'/target/src/index.ts\'');
		expect(vol.readFileSync('/target/src/index2.ts', 'utf8')).to.eql(commandFxt.removeIndex.targetSrc);
	}); // }}}

	it('remove.index.yes', async () => { // {{{
		vol.fromJSON({
			'/target/.artifactrc': commandFxt.removeIndex.targetArtifactrc,
			'/target/package.json': packageFxt.default.project,
			'/target/src/index.ts': commandFxt.removeIndex.targetSrc,
			'/target/src/index2.ts': commandFxt.removeIndex.targetSrc,
			'/incoming/.artifactrc': commandFxt.removeIndex.incomingArtifactrc,
			'/incoming/package.json': commandFxt.removeIndex.incomingPackage,
		}, '/');

		await remove(['awesome-config']);

		expect(vol.readFileSync('/target/.artifactrc', 'utf8')).to.eql(commandFxt.removeIndex.mergedArtifactrc);
		await expect(vol.promises.readFile('/target/src/index.ts', 'utf8')).to.be.rejectedWith('ENOENT: no such file or directory, open \'/target/src/index.ts\'');
		expect(vol.readFileSync('/target/src/index2.ts', 'utf8')).to.eql(commandFxt.removeIndex.targetSrc);
	}); // }}}
});
