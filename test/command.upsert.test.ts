import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { vol } from 'memfs';
import { add, update } from './rewires/artifact.js';
import { fixtures } from './utils/fixtures.js';

use(chaiAsPromised);

describe('command.upsert', () => {
	const commandFxt = fixtures('command-upsert');
	const packageFxt = fixtures('package');

	beforeEach(async () => { // {{{
		vol.reset();
	}); // }}}

	it('add.overwrite.no', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.default.project,
			'/incoming/.artifactrc': commandFxt.overwrite.incomingArtifactrc,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/configs/src/index.ts': commandFxt.overwrite.incomingSrc,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/src/index.ts', 'utf8')).to.eql(commandFxt.overwrite.incomingSrc);
	}); // }}}

	it('add.overwrite.yes', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.default.project,
			'/target/src/index.ts': commandFxt.overwrite.targetSrc,
			'/incoming/.artifactrc': commandFxt.overwrite.incomingArtifactrc,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/configs/src/index.ts': commandFxt.overwrite.incomingSrc,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/src/index.ts', 'utf8')).to.eql(commandFxt.overwrite.incomingSrc);
	}); // }}}

	it('update.overwrite.no', async () => { // {{{
		vol.fromJSON({
			'/target/.artifactrc': commandFxt.newerYes.target,
			'/target/package.json': packageFxt.default.project,
			'/incoming/.artifactrc': commandFxt.overwrite.incomingArtifactrc,
			'/incoming/package.json': commandFxt.newerYes.incomingPackage,
			'/incoming/configs/src/index.ts': commandFxt.overwrite.incomingSrc,
		}, '/');

		await update();

		expect(vol.readFileSync('/target/.artifactrc', 'utf8')).to.eql(commandFxt.newerYes.merged);
		expect(vol.readFileSync('/target/src/index.ts', 'utf8')).to.eql(commandFxt.overwrite.incomingSrc);
	}); // }}}

	it('update.overwrite.yes', async () => { // {{{
		vol.fromJSON({
			'/target/.artifactrc': commandFxt.newerYes.target,
			'/target/package.json': packageFxt.default.project,
			'/target/src/index.ts': commandFxt.overwrite.targetSrc,
			'/incoming/.artifactrc': commandFxt.overwrite.incomingArtifactrc,
			'/incoming/package.json': commandFxt.newerYes.incomingPackage,
			'/incoming/configs/src/index.ts': commandFxt.overwrite.incomingSrc,
		}, '/');

		await update();

		expect(vol.readFileSync('/target/.artifactrc', 'utf8')).to.eql(commandFxt.newerYes.merged);
		expect(vol.readFileSync('/target/src/index.ts', 'utf8')).to.eql(commandFxt.overwrite.incomingSrc);
	}); // }}}
});
