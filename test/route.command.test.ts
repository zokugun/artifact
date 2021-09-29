import { expect } from 'chai';
import { command } from '../src/routes/command';

describe('route.command', () => {
	it('arg.add', async () => { // {{{
		expect(command({
			current: 'ncc build out/extension --out lib --external sql.js',
			incoming: 'ncc build out/extension --out lib',
		})).to.eql('ncc build out/extension --out lib --external sql.js');
	}); // }}}

	it('arg.merge', async () => { // {{{
		expect(command({
			current: 'ncc build out/extension --external sql.js',
			incoming: 'ncc build out/extension --out lib',
		})).to.eql('ncc build out/extension --external sql.js --out lib');
	}); // }}}

	it('join', async () => { // {{{
		expect(command({
			current: 'husky install',
			incoming: 'husky install; fixpack || true',
		})).to.eql('husky install; fixpack || true');
	}); // }}}
});
