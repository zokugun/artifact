import process from 'process';
import pacote from 'pacote';
import tempy from 'tempy';
import npm from 'npm';
import { composeSteps, steps } from '../steps';
import { readConfig, writeConfig } from '../config';

const commonFlow = composeSteps(
	steps.readIncomingPackage,
	steps.validateNotPresentPackage,
	steps.readFiles,
	steps.readEditorConfig,
	steps.mergeTextFiles,
	steps.insertFinalNewLine,
	steps.applyFormatting,
	steps.copyBinaryFiles,
	steps.writeTextFiles,
);

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

export async function add(specs: string[], inputOptions?: { force?: boolean; skip?: boolean; verbose?: boolean }): Promise<void> {
	await npm.load();

	const registry = npm.config.get('registry') as string;
	const targetPath = process.env.INIT_CWD!;

	const options = {
		force: inputOptions?.force ?? false,
		skip: inputOptions?.skip ?? false,
		verbose: inputOptions?.verbose ?? false,
	};

	const [config, configStats] = await readConfig(targetPath);

	for(const spec of specs) {
		const dir = tempy.directory();
		const pkgResult = await pacote.extract(expandSpec(spec), dir, { registry });

		if(!pkgResult.resolved) {
			if(options.force || options.skip) {
				if(options.verbose) {
					console.log(`The artifact '${spec}' couldn't be found, skipping...`);
				}

				continue;
			}
			else {
				throw new Error(pkgResult.from);
			}
		}

		const flowResult = await commonFlow(targetPath, dir, config, options);

		if(!flowResult) {
			continue;
		}

		const { name, version } = flowResult.incomingPackage! as { name: string; version: string };

		let nf = true;
		for(const artifact of config.artifacts) {
			if(artifact.name === name) {
				artifact.version = version;

				nf = false;

				break;
			}
		}

		if(nf) {
			config.artifacts.push({
				name,
				version,
			});
		}

		await writeConfig(config, configStats, flowResult.formats, targetPath, options);
	}
}
