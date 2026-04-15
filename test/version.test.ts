import { expect, use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { vol } from 'memfs';
import { add, update } from './rewires/artifact.js';
import { fixtures } from './utils/fixtures.js';

use(chaiAsPromised);

describe('version', () => {
	const versionFxt = fixtures('version');
	const packageFxt = fixtures('package');

	beforeEach(async () => { // {{{
		vol.reset();
	}); // }}}

	it('v1.update.strict', async () => { // {{{
		vol.fromJSON({
			'/target/.artifactrc': versionFxt.v1UpdateStrict.targetArtifactrc,
			'/target/package.json': packageFxt.default.project,
			'/target/src/index.ts': versionFxt.v1UpdateStrict.targetSrc,
			'/incoming/.artifactrc': versionFxt.v1UpdateStrict.incomingArtifactrc,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/configs/src/index.ts': versionFxt.v1UpdateStrict.incomingSrc,
		}, '/');

		await update();

		expect(vol.readFileSync('/target/.artifactrc', 'utf8')).to.eql(versionFxt.v1UpdateStrict.mergedArtifactrc);
		expect(vol.readFileSync('/target/src/index.ts', 'utf8')).to.eql(versionFxt.v1UpdateStrict.targetSrc);
	}); // }}}

	it('v999.install', async () => { // {{{
		vol.fromJSON({
			'/target/package.json': packageFxt.default.project,
			'/incoming/package.json': packageFxt.default.config,
			'/incoming/.artifactrc.yml': versionFxt.v999.incoming,
		}, '/');

		// eslint-disable-next-line @typescript-eslint/no-floating-promises
		expect(add(['awesome-config'])).to.be.rejectedWith('Error: Don\'t support newer version (v999) in the package\'s ".artifactrc.yml"');

		expect(vol.existsSync('/target/.artifactrc')).to.be.false;
	}); // }}}
});
