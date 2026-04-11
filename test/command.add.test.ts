import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { vol } from 'memfs';
import { add } from './rewires/artifact.js';
import { fixtures } from './utils/fixtures.js';

use(chaiAsPromised);

describe('command.add', () => {
	const commandFxt = fixtures('command-add');
	const packageFxt = fixtures('package');

	beforeEach(async () => { // {{{
		vol.reset();
	}); // }}}

	it('add.json', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.default.project,
			'/target/.artifactrc.json': commandFxt.addJson.target,
			'/incoming/package.json': packageFxt.default.config,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/.artifactrc.json', 'utf8')).to.eql(commandFxt.addJson.merged);
	}); // }}}

	it('add.yaml', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.default.project,
			'/target/.artifactrc.yaml': commandFxt.addYaml.target,
			'/incoming/package.json': packageFxt.default.config,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/.artifactrc.yaml', 'utf8')).to.eql(commandFxt.addYaml.merged);
	}); // }}}

	it('add.yml', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.default.project,
			'/target/.artifactrc.yml': commandFxt.addYaml.target,
			'/incoming/package.json': packageFxt.default.config,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/.artifactrc.yml', 'utf8')).to.eql(commandFxt.addYaml.merged);
	}); // }}}

	it('add.noext.json', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.default.project,
			'/target/.artifactrc': commandFxt.addJson.target,
			'/incoming/package.json': packageFxt.default.config,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/.artifactrc', 'utf8')).to.eql(commandFxt.addJson.merged);
	}); // }}}

	it('add.noext.yaml', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.default.project,
			'/target/.artifactrc': commandFxt.addYaml.target,
			'/incoming/package.json': packageFxt.default.config,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/.artifactrc', 'utf8')).to.eql(commandFxt.addYaml.merged);
	}); // }}}

	it('new', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.default.project,
			'/incoming/package.json': packageFxt.default.config,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/.artifactrc.yml', 'utf8')).to.eql(commandFxt.default.merged);
	}); // }}}

	it('readd.default', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.default.project,
			'/target/.artifactrc.yml': commandFxt.readd.target,
			'/incoming/package.json': packageFxt.default.config,
		}, '/');

		await expect(add(['awesome-config'])).to.be.rejectedWith('The incoming artifact has already been added.');
	}); // }}}

	it('readd.force', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.default.project,
			'/target/.artifactrc.yml': commandFxt.readd.target,
			'/incoming/package.json': packageFxt.default.config,
		}, '/');

		await add(['awesome-config'], { force: true });

		expect(vol.readFileSync('/target/.artifactrc.yml', 'utf8')).to.eql(commandFxt.readd.merged);
	}); // }}}

	it('readd.skip', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.default.project,
			'/target/.artifactrc.yml': commandFxt.readd.target,
			'/incoming/package.json': packageFxt.default.config,
		}, '/');

		await add(['awesome-config'], { skip: true });

		expect(vol.readFileSync('/target/.artifactrc.yml', 'utf8')).to.eql(commandFxt.readd.target);
	}); // }}}

	it('overwrite.no', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.default.project,
			'/incoming/.artifactrc': commandFxt.overwrite.incomingArtifactrc,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/configs/src/index.ts': commandFxt.overwrite.incomingSrc,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/src/index.ts', 'utf8')).to.eql(commandFxt.overwrite.incomingSrc);
	}); // }}}

	it('overwrite.yes', async () => { // {{{
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

	it('remove.no', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.default.project,
			'/incoming/.artifactrc': commandFxt.remove.incomingArtifactrc,
			'/incoming/package.json': packageFxt.default.config,
		}, '/');

		await add(['awesome-config']);

		await expect(vol.promises.readFile('/target/src/index.ts', 'utf8')).to.be.rejectedWith('ENOENT: no such file or directory, open \'/target/src/index.ts\'');
	}); // }}}

	it('remove.yes', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.default.project,
			'/target/src/index.ts': commandFxt.remove.targetSrc,
			'/incoming/.artifactrc': commandFxt.remove.incomingArtifactrc,
			'/incoming/package.json': packageFxt.default.config,
		}, '/');

		await add(['awesome-config']);

		await expect(vol.promises.readFile('/target/src/index.ts', 'utf8')).to.be.rejectedWith('ENOENT: no such file or directory, open \'/target/src/index.ts\'');
	}); // }}}

	it('rename.no', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.default.project,
			'/incoming/.artifactrc': commandFxt.rename.incomingArtifactrc,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/configs/workflows/ci-pr.yml': commandFxt.rename.incomingYml,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/workflows/ci-pr.yml', 'utf8')).to.eql(commandFxt.rename.incomingYml);
	}); // }}}

	it('rename.yes', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.default.project,
			'/target/workflows/check-pr.yml': commandFxt.rename.targetYml,
			'/incoming/.artifactrc': commandFxt.rename.incomingArtifactrc,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/configs/workflows/ci-pr.yml': commandFxt.rename.incomingYml,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/workflows/ci-pr.yml', 'utf8')).to.eql(commandFxt.rename.mergedYml);
	}); // }}}
});
