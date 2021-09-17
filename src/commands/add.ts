import process from 'process';
import pacote from 'pacote';
import tempy from 'tempy';
import npm from 'npm';
import { install } from '../install';

function expandSpec(spec: string): string { // {{{
	if(spec.includes('/')) {
		const [scope, name] = spec.split('/');

		if(name.startsWith('artifact-')) {
			return spec;
		}
		else {
			return `${scope}/artifact-${name}`;
		}
	}
	else {
		if(spec.startsWith('artifact-')) {
			return spec;
		}
		else {
			return `artifact-${spec}`;
		}
	}
} // }}}

export async function add(specs: string[], options: { verbose: boolean }): Promise<void> {
	await npm.load();

	const registry = npm.config.get('registry') as string;
	const targetPath = process.env.INIT_CWD!;

	for(const spec of specs) {
		const dir = tempy.directory();
		const result = await pacote.extract(expandSpec(spec), dir, { registry });

		if(!result.resolved) {
			throw new Error(result.from);
		}

		await install(targetPath, dir, {
			verbose: options.verbose,
		});
	}
}
