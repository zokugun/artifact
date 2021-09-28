import path from 'path';
import fse from 'fs-extra';
import yaml from 'yaml';
import { Config, ConfigStats } from '../types/config';

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

export async function readConfig(targetPath: string): Promise<[Config, ConfigStats]> {
	let data: string | undefined;
	let name: string;
	let type: string | undefined;

	for(const place of places) {
		try {
			data = await fse.readFile(path.join(targetPath, place.name), 'utf-8');

			name = place.name;
			type = place.type;

			break;
		}
		catch {
		}
	}

	if(!data) {
		return [
			{
				artifacts: [],
				update: {},
			},
			{
				name: '.artifactrc.yml',
				type: 'yaml',
				finalNewLine: true,
			},
		];
	}

	const finalNewLine = data.endsWith('\n');

	let config: Config;
	if(type === 'json') {
		config = JSON.parse(data) as Config;
	}
	else if(type === 'yaml') {
		config = yaml.parse(data) as Config;
	}
	else {
		try {
			config = JSON.parse(data) as Config;
			type = 'json';
		}
		catch {
			config = yaml.parse(data) as Config;
			type = 'yaml';
		}
	}

	if(typeof config.update === 'undefined') {
		config.update = {};
	}

	return [
		config,
		{
			name: name!,
			type,
			finalNewLine,
		},
	];
}
