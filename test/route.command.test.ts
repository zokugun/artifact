import { expect } from 'chai';
import { command } from '../src/routes/command.js';

describe('route.command', () => {
	it('flags.add', async () => { // {{{
		expect(await command({
			current: 'ncc build out/extension --out lib --external sql.js',
			incoming: 'ncc build out/extension --out lib',
		})).to.eql('ncc build out/extension --out lib --external sql.js');
	}); // }}}

	it('flags.merge', async () => { // {{{
		expect(await command({
			current: 'ncc build out/extension --external sql.js',
			incoming: 'ncc build out/extension --out lib',
		})).to.eql('ncc build out/extension --external sql.js --out lib');
	}); // }}}

	it('flags.nomerge', async () => { // {{{
		expect(await command({
			current: 'ncc build out/extension --external sql.js',
			incoming: 'ncc build out/extension2 --out lib',
		})).to.eql('ncc build out/extension --external sql.js; ncc build out/extension2 --out lib');
	}); // }}}

	it('eql.or-true', async () => { // {{{
		expect(await command({
			current: 'husky install',
			incoming: 'husky install; fixpack || true',
		})).to.eql('husky install; fixpack || true');
	}); // }}}

	it('noteql.or-true', async () => { // {{{
		expect(await command({
			current: 'husky install',
			incoming: 'husky install2; fixpack || true',
		})).to.eql('husky install; husky install2; fixpack || true');
	}); // }}}

	it('noflags.noand', async () => { // {{{
		expect(await command({
			current: 'npm run ci:lint',
			incoming: 'npm run lint',
		})).to.eql('npm run ci:lint; npm run lint');
	}); // }}}

	it('noflags.second-and-true.try1', async () => { // {{{
		expect(await command({
			current: 'npm run ci:lint',
			incoming: 'true && npm run lint',
		})).to.eql('npm run ci:lint && npm run lint');
	}); // }}}

	it('noflags.second-and-true.try2a', async () => { // {{{
		expect(await command({
			current: 'npm run ci:lint && npm run lint',
			incoming: 'npm run ci:lint',
		})).to.eql('npm run ci:lint && npm run lint');
	}); // }}}

	it('noflags.second-and-true.try2b', async () => { // {{{
		expect(await command({
			current: 'npm run ci:lint && npm run lint',
			incoming: 'true && npm run lint',
		})).to.eql('npm run ci:lint && npm run lint');
	}); // }}}

	it('noflags.first-and', async () => { // {{{
		expect(await command({
			current: 'fixpack && npm run ci:lint',
			incoming: 'npm run lint',
		})).to.eql('fixpack && npm run ci:lint && npm run lint');
	}); // }}}

	it('noflags.first-and.second-and-true', async () => { // {{{
		expect(await command({
			current: 'fixpack && npm run ci:lint',
			incoming: 'true && npm run lint',
		})).to.eql('fixpack && npm run ci:lint && npm run lint');
	}); // }}}

	it('merge-shared-flags-and-preserve-order', async () => { // {{{
		expect(await command({
			current: 'foo bar -v; bar -v',
			incoming: 'foo bar -t; bar baz',
		})).to.eql('foo bar -v -t; bar -v; bar baz');
	}); // }}}

	it('idempotent-when-incoming-duplicates', async () => { // {{{
		expect(await command({
			current: 'foo bar -v -t; bar -v; bar baz',
			incoming: 'foo bar -t; bar baz',
		})).to.eql('foo bar -v -t; bar -v; bar baz');
	}); // }}}

	it('merge-different-subcommands', async () => { // {{{
		expect(await command({
			current: 'foo bar -v; bar -v',
			incoming: 'foo baz -t; bar -t',
		})).to.eql('foo bar -v; bar -v -t; foo baz -t');
	}); // }}}

	it('and-operator-merge-flags', async () => { // {{{
		expect(await command({
			current: 'foo bar -v && bar -v',
			incoming: 'foo bar -t && bar baz',
		})).to.eql('foo bar -v -t && bar -v && bar baz');
	}); // }}}

	it('and-idempotent', async () => { // {{{
		expect(await command({
			current: 'foo bar -v && bar -v && bar baz',
			incoming: 'foo bar -t && bar baz',
		})).to.eql('foo bar -v -t && bar -v && bar baz');
	}); // }}}

	it('or-to-seq-and-merging', async () => { // {{{
		expect(await command({
			current: 'foo bar -v && bar -v',
			incoming: 'foo baz -t && bar -t',
		})).to.eql('foo bar -v; bar -v -t; foo baz -t');
	}); // }}}

	it('and-and-seq-mix', async () => { // {{{
		expect(await command({
			current: 'foo bar -v && bar -v; bar baz',
			incoming: 'foo bar -t && bar baz',
		})).to.eql('foo bar -v -t && bar -v && bar baz');
	}); // }}}

	it('and-and-seq-mix-reverse', async () => { // {{{
		expect(await command({
			current: 'foo bar -t && bar baz',
			incoming: 'foo bar -v && bar -v; bar baz',
		})).to.eql('foo bar -v -t && bar -v; bar baz');
	}); // }}}

	it('and-seq-with-extra', async () => { // {{{
		expect(await command({
			current: 'foo bar -v && bar -v; bar qux',
			incoming: 'foo bar -t && bar baz',
		})).to.eql('foo bar -v -t && bar -v && bar baz; bar qux');
	}); // }}}

	it('and-seq-with-extra-reverse', async () => { // {{{
		expect(await command({
			current: 'foo bar -t && bar baz',
			incoming: 'foo bar -v && bar -v; bar qux',
		})).to.eql('foo bar -v -t && bar baz && bar -v; bar qux');
	}); // }}}

	it('or-with-flag-propagation', async () => { // {{{
		expect(await command({
			current: 'foo bar -v -t || bar -v; bar baz',
			incoming: 'foo bar -t || bar -t',
		})).to.eql('foo bar -v -t || bar -v -t; bar baz');
	}); // }}}

	it('or-and-merge-to-flag', async () => { // {{{
		expect(await command({
			current: 'foo bar -v || bar -v; bar baz',
			incoming: 'foo bar -t || bar baz',
		})).to.eql('foo bar -v -t || bar -v || bar baz');
	}); // }}}

	it('or-and-merge-to-flag-reverse', async () => { // {{{
		expect(await command({
			current: 'foo bar -t || bar baz',
			incoming: 'foo bar -v || bar -v; bar baz',
		})).to.eql('foo bar -v -t || bar -v; bar baz');
	}); // }}}

	it('or-and-with-trailing-and', async () => { // {{{
		expect(await command({
			current: 'foo bar -v || bar -v; bar baz && qux',
			incoming: 'foo bar -t || bar baz',
		})).to.eql('foo bar -v -t || bar -v; bar baz && qux');
	}); // }}}

	it('or-and-with-trailing-and-reverse', async () => { // {{{
		expect(await command({
			current: 'foo bar -t || bar baz',
			incoming: 'foo bar -v || bar -v; bar baz && qux',
		})).to.eql('foo bar -v -t || bar -v; bar baz && qux');
	}); // }}}

	it('or-and-with-duplicate-and-order', async () => { // {{{
		expect(await command({
			current: 'foo bar -v || bar -v; bar baz && qux',
			incoming: 'foo bar -t || bar qux',
		})).to.eql('foo bar -v -t || bar -v || bar qux; bar baz && qux');
	}); // }}}

	it('or-and-with-duplicate-and-order-reverse', async () => { // {{{
		expect(await command({
			current: 'foo bar -t || bar qux',
			incoming: 'foo bar -v || bar -v; bar baz && qux',
		})).to.eql('foo bar -v -t || bar qux || bar -v; bar baz && qux');
	}); // }}}

	it('or-true-idempotent', async () => { // {{{
		expect(await command({
			current: 'husky; fixpack || true',
			incoming: 'husky; fixpack || true',
		})).to.eql('husky; fixpack || true');
	}); // }}}

	it('rimraf-preserve-extra-entries', async () => { // {{{
		expect(await command({
			current: 'rimraf lib .src .test',
			incoming: 'rimraf .src',
		})).to.eql('rimraf lib .src .test');
	}); // }}}

	it('noflags.keep-order', async () => { // {{{
		expect(await command({
			current: 'fixpack && npm run ci:lint && npm run lint',
			incoming: 'fixpack && npm audit && npm run ci:lint',
		})).to.eql('fixpack && npm audit && npm run ci:lint && npm run lint');
	}); // }}}

	it('nosharing.singletons', async () => { // {{{
		expect(await command({
			current: 'vitest',
			incoming: 'tsc-watch -p test',
		})).to.eql('vitest; tsc-watch -p test');
	}); // }}}

	it('nosharing.same-command-instances', async () => { // {{{
		expect(await command({
			current: 'rimraf lib; rimraf .test',
			incoming: 'rimraf .src',
		})).to.eql('rimraf lib; rimraf .test; rimraf .src');
	}); // }}}
});
