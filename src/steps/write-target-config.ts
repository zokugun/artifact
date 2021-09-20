import yaml from 'yaml';
import { Context } from '../types/context';

export async function writeTargetConfig({ config, configInfo, incomingPackage, mergedTextFiles }: Context): Promise<void> {
	const name = incomingPackage!.name as string;
	const version = incomingPackage!.version as string;

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

	if(!configInfo) {
		configInfo = {
			name: '.artifactrc.yml',
			type: 'yaml',
			finalNewLine: true,
		};
	}

	const data = configInfo.type === 'yaml' ? yaml.stringify(config) : JSON.stringify(config, null, '\t');

	mergedTextFiles.push({
		name: configInfo.name,
		data,
		finalNewLine: configInfo.finalNewLine,
	});
}
