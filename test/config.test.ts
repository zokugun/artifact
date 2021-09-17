import { expect } from 'chai';
import { vol } from 'memfs';
import { fixtures } from './utils/fixtures';
import { install } from './rewires/install';

describe('config', () => {
	const configFxt = fixtures('config');
	const packageFxt = fixtures('package');

	beforeEach(async () => { // {{{
		vol.reset();
	}); // }}}

	it('add.json', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.default.project,
			'/target/.artifactrc.json': configFxt.addJson.target,
			'/incoming/package.json': packageFxt.default.config,
		}, '/');

		await install('/target', '/incoming');

		expect(vol.readFileSync('/target/.artifactrc.json', 'utf-8')).to.eql(configFxt.addJson.merged);
	}); // }}}

	it('add.yaml', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.default.project,
			'/target/.artifactrc.yaml': configFxt.addYaml.target,
			'/incoming/package.json': packageFxt.default.config,
		}, '/');

		await install('/target', '/incoming');

		expect(vol.readFileSync('/target/.artifactrc.yaml', 'utf-8')).to.eql(configFxt.addYaml.merged);
	}); // }}}

	it('add.yml', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.default.project,
			'/target/.artifactrc.yml': configFxt.addYaml.target,
			'/incoming/package.json': packageFxt.default.config,
		}, '/');

		await install('/target', '/incoming');

		expect(vol.readFileSync('/target/.artifactrc.yml', 'utf-8')).to.eql(configFxt.addYaml.merged);
	}); // }}}

	it('add.noext.json', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.default.project,
			'/target/.artifactrc': configFxt.addJson.target,
			'/incoming/package.json': packageFxt.default.config,
		}, '/');

		await install('/target', '/incoming');

		expect(vol.readFileSync('/target/.artifactrc', 'utf-8')).to.eql(configFxt.addJson.merged);
	}); // }}}

	it('add.noext.yaml', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.default.project,
			'/target/.artifactrc': configFxt.addYaml.target,
			'/incoming/package.json': packageFxt.default.config,
		}, '/');

		await install('/target', '/incoming');

		expect(vol.readFileSync('/target/.artifactrc', 'utf-8')).to.eql(configFxt.addYaml.merged);
	}); // }}}

	it('new', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.default.project,
			'/incoming/package.json': packageFxt.default.config,
		}, '/');

		await install('/target', '/incoming');

		expect(vol.readFileSync('/target/.artifactrc.yml', 'utf-8')).to.eql(configFxt.default.merged);
	}); // }}}

	it('update', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.default.project,
			'/target/.artifactrc.yml': configFxt.update.target,
			'/incoming/package.json': packageFxt.default.config,
		}, '/');

		await install('/target', '/incoming');

		expect(vol.readFileSync('/target/.artifactrc.yml', 'utf-8')).to.eql(configFxt.update.merged);
	}); // }}}
});
