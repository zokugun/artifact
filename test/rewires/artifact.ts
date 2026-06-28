import process from 'node:process';
import { vi } from 'vitest';
import { fs } from '../mocks/fs.js';

const DEBUG = process.env.DEBUG === '1' || process.env.DEBUG === 'true' || process.env.DEBUG === 'on' || process.env.DEBUG === 'vol';

vi.resetModules();

vi.doMock('node:fs', () => (
	{
		...fs,
		default: fs,
	}
));
vi.doMock('node:fs/promises', () => ({ default: fs.promises }));

vi.doMock('node:process', () => ({
	default: {
		cwd: () => '/target',
		env: {},
	},
}));

vi.doMock('npm', () => ({
	config: {
		get: () => null,
	},
	load: async () => {
		// do nothing
	},
	log: {},
}));

vi.doMock('pacote', () => ({
	default: {
		extract: () => ({ resolved: true }),
	},
}));

vi.doMock('@zokugun/cli-utils', () => ({
	c: {
		bgBlue: (value: string) => value,
		cyan: {
			bold: (value: string) => value,
		},
	},
	logger: {
		beginTimer: () => {},
		debug: (message: string) => {
			if(DEBUG) {
				console.log(message);
			}
		},
		createSpinner: () => ({
			fail: () => {},
			succeed: () => {},
		}),
		fatal: (message: string) => {
			throw new Error(message);
		},
		finishTimer: () => {},
		info: (message: string) => {
			if(DEBUG) {
				console.log(message);
			}
		},
		newLine: () => {},
		print: (message: string) => {
			if(DEBUG) {
				console.log(message);
			}
		},
	},
}));

vi.doMock('../../src/utils/load-package.js', () => ({
	loadPackage: (spec: string) => {
		const index = spec.lastIndexOf('@');

		if(index === -1) {
			return `/registry/${spec}`;
		}

		return `/registry/${spec.slice(0, index)}`;
	},
}));

const { add } = await import('../../src/commands/add.js');
const { remove } = await import('../../src/commands/remove.js');
const { update } = await import('../../src/commands/update.js');

vi.unmock('node:fs');
vi.unmock('node:fs/promises');
vi.unmock('node:process');
vi.unmock('npm');
vi.unmock('pacote');
vi.unmock('@zokugun/cli-utils');
vi.unmock('../../src/utils/load-package.js');

export {
	add,
	remove,
	update,
};
