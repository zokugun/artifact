import path from 'path';
import fse from 'fs-extra';
import yaml from 'yaml';
import { PackageConfig } from '../../types/config';

const places = [
	{
		name: '.artifactrc.yml',
		type: 'yaml',
	},
	{
		name: '.artifactrc.yaml',
		type: 'yaml',
	},
	{
		name: '.artifactrc.json',
		type: 'json',
	},
	{
		name: '.artifactrc',
	},
];

export async function readPackageConfig(targetPath: string): Promise<PackageConfig> {
	let content: string | undefined;
	let type: string | undefined;

	for(const place of places) {
		try {
			content = await fse.readFile(path.join(targetPath, place.name), 'utf-8');
			type = place.type;

			break;
		}
		catch {
		}
	}

	if(!content) {
		return {
			install: {},
			update: {},
		};
	}

	let config: PackageConfig;
	if(type === 'json') {
		config = JSON.parse(content) as PackageConfig;
	}
	else if(type === 'yaml') {
		config = yaml.parse(content) as PackageConfig;
	}
	else {
		try {
			config = JSON.parse(content) as PackageConfig;
			type = 'json';
		}
		catch {
			config = yaml.parse(content) as PackageConfig;
			type = 'yaml';
		}
	}

	if(typeof config.update === 'undefined') {
		config.update = {};
	}

	return config;
}
