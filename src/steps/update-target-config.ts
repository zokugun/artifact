import yaml from 'yaml';
import { Context } from '../types/context';

export async function updateTargetConfig({ configs, configInfo, incomingPackage, mergedTextFiles }: Context): Promise<void> {
	const name = incomingPackage!.name as string;
	const version = incomingPackage!.version as string;

	let nf = true;
	for(const config of configs) {
		if(config.name === name) {
			config.version = version;
			nf = false;

			break;
		}
	}

	if(nf) {
		configs.push({
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

	const data = configInfo.type === 'yaml' ? yaml.stringify(configs) : JSON.stringify(configs, null, '\t');

	mergedTextFiles.push({
		name: configInfo.name,
		data,
		finalNewLine: configInfo.finalNewLine,
	});
}
