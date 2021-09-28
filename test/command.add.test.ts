import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { vol } from 'memfs';
import { fixtures } from './utils/fixtures';
import { add } from './rewires/artifact';

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

		expect(vol.readFileSync('/target/.artifactrc.json', 'utf-8')).to.eql(commandFxt.addJson.merged);
	}); // }}}

	it('add.yaml', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.default.project,
			'/target/.artifactrc.yaml': commandFxt.addYaml.target,
			'/incoming/package.json': packageFxt.default.config,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/.artifactrc.yaml', 'utf-8')).to.eql(commandFxt.addYaml.merged);
	}); // }}}

	it('add.yml', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.default.project,
			'/target/.artifactrc.yml': commandFxt.addYaml.target,
			'/incoming/package.json': packageFxt.default.config,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/.artifactrc.yml', 'utf-8')).to.eql(commandFxt.addYaml.merged);
	}); // }}}

	it('add.noext.json', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.default.project,
			'/target/.artifactrc': commandFxt.addJson.target,
			'/incoming/package.json': packageFxt.default.config,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/.artifactrc', 'utf-8')).to.eql(commandFxt.addJson.merged);
	}); // }}}

	it('add.noext.yaml', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.default.project,
			'/target/.artifactrc': commandFxt.addYaml.target,
			'/incoming/package.json': packageFxt.default.config,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/.artifactrc', 'utf-8')).to.eql(commandFxt.addYaml.merged);
	}); // }}}

	it('new', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.default.project,
			'/incoming/package.json': packageFxt.default.config,
		}, '/');

		await add(['awesome-config']);

		expect(vol.readFileSync('/target/.artifactrc.yml', 'utf-8')).to.eql(commandFxt.default.merged);
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

		expect(vol.readFileSync('/target/.artifactrc.yml', 'utf-8')).to.eql(commandFxt.readd.merged);
	}); // }}}

	it('readd.skip', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.default.project,
			'/target/.artifactrc.yml': commandFxt.readd.target,
			'/incoming/package.json': packageFxt.default.config,
		}, '/');

		await add(['awesome-config'], { skip: true });

		expect(vol.readFileSync('/target/.artifactrc.yml', 'utf-8')).to.eql(commandFxt.readd.target);
	}); // }}}
});
