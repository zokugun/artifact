import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { vol } from 'memfs';
import { update } from './rewires/artifact.js';
import { fixtures } from './utils/fixtures.js';

use(chaiAsPromised);

describe('command.update', () => {
	const commandFxt = fixtures('command-update');
	const ignoreFxt = fixtures('ignore');
	const packageFxt = fixtures('package');

	beforeEach(async () => { // {{{
		vol.reset();
	}); // }}}

	it('disabled', async () => { // {{{
		vol.fromJSON({
			'/target/.artifactrc': commandFxt.newerYes.target,
			'/target/.gitignore': ignoreFxt.merge.target,
			'/target/package.json': packageFxt.default.project,
			'/incoming/.artifactrc': commandFxt.disabled.incomingArtifactrc,
			'/incoming/package.json': commandFxt.newerYes.incomingPackage,
			'/incoming/configs/gitignore': ignoreFxt.merge.incoming,
		}, '/');

		await update();

		expect(vol.readFileSync('/target/.artifactrc', 'utf8')).to.eql(commandFxt.newerYes.merged);
		expect(vol.readFileSync('/target/.gitignore', 'utf8')).to.eql(ignoreFxt.merge.target);
	}); // }}}

	it('filter', async () => { // {{{
		vol.fromJSON({
			'/target/.artifactrc': commandFxt.newerYes.target,
			'/target/package.json': commandFxt.filter.targetPackage,
			'/incoming/.artifactrc': commandFxt.filter.incomingArtifactrc,
			'/incoming/package.json': commandFxt.newerYes.incomingPackage,
			'/incoming/configs/package.json': commandFxt.filter.incomingPackage,
		}, '/');

		await update();

		expect(vol.readFileSync('/target/.artifactrc', 'utf8')).to.eql(commandFxt.newerYes.merged);
		expect(vol.readFileSync('/target/package.json', 'utf8')).to.eql(commandFxt.filter.mergedPackage);
	}); // }}}

	it('missing.no', async () => { // {{{
		vol.fromJSON({
			'/target/.artifactrc': commandFxt.newerYes.target,
			'/target/package.json': packageFxt.default.project,
			'/target/src/index.ts': commandFxt.missing.targetSrc,
			'/incoming/.artifactrc': commandFxt.missing.incomingArtifactrc,
			'/incoming/package.json': commandFxt.newerYes.incomingPackage,
			'/incoming/configs/src/index.ts': commandFxt.missing.incomingSrc,
		}, '/');

		await update();

		expect(vol.readFileSync('/target/.artifactrc', 'utf8')).to.eql(commandFxt.newerYes.merged);
		expect(vol.readFileSync('/target/src/index.ts', 'utf8')).to.eql(commandFxt.missing.incomingSrc);
	}); // }}}

	it('missing.yes', async () => { // {{{
		vol.fromJSON({
			'/target/.artifactrc': commandFxt.newerYes.target,
			'/target/package.json': packageFxt.default.project,
			'/incoming/.artifactrc': commandFxt.missing.incomingArtifactrc,
			'/incoming/package.json': commandFxt.newerYes.incomingPackage,
			'/incoming/configs/src/index.ts': commandFxt.missing.incomingSrc,
		}, '/');

		await update();

		expect(vol.readFileSync('/target/.artifactrc', 'utf8')).to.eql(commandFxt.newerYes.merged);
		expect(vol.existsSync('/target/src/index.ts')).to.eql(false);
	}); // }}}

	it('newer.no', async () => { // {{{
		vol.fromJSON({
			'/target/.artifactrc': commandFxt.newerNo.target,
			'/target/.gitignore': ignoreFxt.merge.target,
			'/target/package.json': packageFxt.default.project,
			'/incoming/package.json': commandFxt.newerNo.incomingPackage,
			'/incoming/configs/gitignore': ignoreFxt.merge.incoming,
		}, '/');

		await update();

		expect(vol.readFileSync('/target/.artifactrc', 'utf8')).to.eql(commandFxt.newerNo.target);
		expect(vol.readFileSync('/target/.gitignore', 'utf8')).to.eql(ignoreFxt.merge.target);
	}); // }}}

	it('newer.yes', async () => { // {{{
		vol.fromJSON({
			'/target/.artifactrc': commandFxt.newerYes.target,
			'/target/.gitignore': ignoreFxt.merge.target,
			'/target/package.json': packageFxt.default.project,
			'/incoming/package.json': commandFxt.newerYes.incomingPackage,
			'/incoming/configs/gitignore': ignoreFxt.merge.incoming,
		}, '/');

		await update();

		expect(vol.readFileSync('/target/.artifactrc', 'utf8')).to.eql(commandFxt.newerYes.merged);
		expect(vol.readFileSync('/target/.gitignore', 'utf8')).to.eql(ignoreFxt.merge.merged);
	}); // }}}

	it('route', async () => { // {{{
		vol.fromJSON({
			'/target/.artifactrc': commandFxt.newerYes.target,
			'/target/.xo-config.json': commandFxt.route.targetXoConfig,
			'/target/package.json': packageFxt.default.project,
			'/incoming/.artifactrc': commandFxt.route.incomingArtifactrc,
			'/incoming/package.json': commandFxt.newerYes.incomingPackage,
			'/incoming/configs/.xo-config.json': commandFxt.route.incomingXoConfig,
		}, '/');

		await update();

		expect(vol.readFileSync('/target/.artifactrc', 'utf8')).to.eql(commandFxt.newerYes.merged);
		expect(vol.readFileSync('/target/.xo-config.json', 'utf8')).to.eql(commandFxt.route.mergedXoConfig);
	}); // }}}

	it('strict.no', async () => { // {{{
		vol.fromJSON({
			'/target/.artifactrc': commandFxt.newerYes.target,
			'/target/package.json': packageFxt.default.project,
			'/incoming/.artifactrc': commandFxt.strict.incomingArtifactrc,
			'/incoming/package.json': commandFxt.newerYes.incomingPackage,
			'/incoming/configs/src/index.ts': commandFxt.strict.incomingSrc,
		}, '/');

		await update();

		expect(vol.readFileSync('/target/.artifactrc', 'utf8')).to.eql(commandFxt.newerYes.merged);
		expect(vol.existsSync('/target/src/index.ts')).to.eql(false);
	}); // }}}

	it('strict.yes', async () => { // {{{
		vol.fromJSON({
			'/target/.artifactrc': commandFxt.newerYes.target,
			'/target/package.json': packageFxt.default.project,
			'/target/src/index.ts': commandFxt.strict.targetSrc,
			'/incoming/.artifactrc': commandFxt.strict.incomingArtifactrc,
			'/incoming/package.json': commandFxt.newerYes.incomingPackage,
			'/incoming/configs/src/index.ts': commandFxt.strict.incomingSrc,
		}, '/');

		await update();

		expect(vol.readFileSync('/target/.artifactrc', 'utf8')).to.eql(commandFxt.newerYes.merged);
		expect(vol.readFileSync('/target/src/index.ts', 'utf8')).to.eql(commandFxt.strict.targetSrc);
	}); // }}}

	it('update.no', async () => { // {{{
		vol.fromJSON({
			'/target/.artifactrc': commandFxt.newerYes.target,
			'/target/package.json': packageFxt.default.project,
			'/incoming/.artifactrc': commandFxt.updateNo.incomingArtifactrc,
			'/incoming/package.json': commandFxt.newerYes.incomingPackage,
			'/incoming/configs/src/index.ts': commandFxt.updateNo.incomingSrc,
		}, '/');

		await update();

		expect(vol.readFileSync('/target/.artifactrc', 'utf8')).to.eql(commandFxt.newerYes.merged);
		expect(vol.readFileSync('/target/src/index.ts', 'utf8')).to.eql(commandFxt.updateNo.incomingSrc);
	}); // }}}

	it('update.yes', async () => { // {{{
		vol.fromJSON({
			'/target/.artifactrc': commandFxt.newerYes.target,
			'/target/package.json': packageFxt.default.project,
			'/target/src/index.ts': commandFxt.updateYes.targetSrc,
			'/incoming/.artifactrc': commandFxt.updateYes.incomingArtifactrc,
			'/incoming/package.json': commandFxt.newerYes.incomingPackage,
			'/incoming/configs/src/index.ts': commandFxt.updateYes.incomingSrc,
		}, '/');

		await update();

		expect(vol.readFileSync('/target/.artifactrc', 'utf8')).to.eql(commandFxt.newerYes.merged);
		expect(vol.readFileSync('/target/src/index.ts', 'utf8')).to.eql(commandFxt.updateYes.incomingSrc);
	}); // }}}

	it('overwrite.no', async () => { // {{{
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

	it('overwrite.yes', async () => { // {{{
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

	it('remove.no', async () => { // {{{
		vol.fromJSON({
			'/target/.artifactrc': commandFxt.newerYes.target,
			'/target/package.json': packageFxt.default.project,
			'/incoming/.artifactrc': commandFxt.remove.incomingArtifactrc,
			'/incoming/package.json': commandFxt.newerYes.incomingPackage,
		}, '/');

		await update();

		expect(vol.readFileSync('/target/.artifactrc', 'utf8')).to.eql(commandFxt.newerYes.merged);
		await expect(vol.promises.readFile('/target/src/index.ts', 'utf8')).to.be.rejectedWith('ENOENT: no such file or directory, open \'/target/src/index.ts\'');
	}); // }}}

	it('remove.yes', async () => { // {{{
		vol.fromJSON({
			'/target/.artifactrc': commandFxt.newerYes.target,
			'/target/package.json': packageFxt.default.project,
			'/target/src/index.ts': commandFxt.remove.targetSrc,
			'/incoming/.artifactrc': commandFxt.remove.incomingArtifactrc,
			'/incoming/package.json': commandFxt.newerYes.incomingPackage,
		}, '/');

		await update();

		expect(vol.readFileSync('/target/.artifactrc', 'utf8')).to.eql(commandFxt.newerYes.merged);
		await expect(vol.promises.readFile('/target/src/index.ts', 'utf8')).to.be.rejectedWith('ENOENT: no such file or directory, open \'/target/src/index.ts\'');
	}); // }}}

	it('rename.no', async () => { // {{{
		vol.fromJSON({
			'/target/.artifactrc': commandFxt.newerYes.target,
			'/target/package.json': packageFxt.default.project,
			'/incoming/.artifactrc': commandFxt.rename.incomingArtifactrc,
			'/incoming/package.json': commandFxt.newerYes.incomingPackage,
			'/incoming/configs/workflows/ci-pr.yml': commandFxt.rename.incomingYml,
		}, '/');

		await update();

		expect(vol.readFileSync('/target/.artifactrc', 'utf8')).to.eql(commandFxt.newerYes.merged);
		expect(vol.readFileSync('/target/workflows/ci-pr.yml', 'utf8')).to.eql(commandFxt.rename.incomingYml);
	}); // }}}

	it('rename.yes', async () => { // {{{
		vol.fromJSON({
			'/target/.artifactrc': commandFxt.newerYes.target,
			'/target/package.json': packageFxt.default.project,
			'/target/workflows/check-pr.yml': commandFxt.rename.targetYml,
			'/incoming/.artifactrc': commandFxt.rename.incomingArtifactrc,
			'/incoming/package.json': commandFxt.newerYes.incomingPackage,
			'/incoming/configs/workflows/ci-pr.yml': commandFxt.rename.incomingYml,
		}, '/');

		await update();

		expect(vol.readFileSync('/target/.artifactrc', 'utf8')).to.eql(commandFxt.newerYes.merged);
		expect(vol.readFileSync('/target/workflows/ci-pr.yml', 'utf8')).to.eql(commandFxt.rename.mergedYml);
	}); // }}}
});
