import process from 'process';
import { last } from 'lodash';
import { readInstallConfig } from '../configs';
import { Artifact } from '../types/config';

function formatVariant(artifact: Artifact): string {
	const variant = Array.isArray(artifact.requires) ? last(artifact.requires) ?? '' : '';

	if(variant.length > 0) {
		return `:${variant}`;
	}
	else {
		return '';
	}
}

export async function list(): Promise<void> {
	const targetPath = process.env.INIT_CWD!;
	const { config, configStats } = await readInstallConfig(targetPath);
	const artifacts = Object.entries(config.artifacts);

	if(artifacts.length === 0) {
		console.log('No artifacts have been installed.');
	}
	else {
		console.log(`List of installed artifacts (${configStats.name}):\n`);

		for(const [name, artifact] of artifacts) {
			const version = artifact.version ? `@${artifact.version}` : '';

			console.log(`- ${name}${version}${formatVariant(artifact)}`);
		}
	}

	console.log();
}
