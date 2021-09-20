import path from 'path';
import fse from 'fs-extra';
import yaml from 'yaml';
import { Context } from '../types/context';
import { Config } from '../types/config';

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

export async function readTargetConfig(context: Context): Promise<void> {
	let data: string | undefined;
	let name: string;
	let type: string | undefined;

	for(const place of places) {
		try {
			data = await fse.readFile(path.join(context.targetPath, place.name), 'utf-8');

			name = place.name;
			type = place.type;

			break;
		}
		catch {
		}
	}

	if(!data) {
		return;
	}

	const finalNewLine = data.endsWith('\n');

	if(type === 'json') {
		context.config = JSON.parse(data) as Config;
	}
	else if(type === 'yaml') {
		context.config = yaml.parse(data) as Config;
	}
	else {
		try {
			context.config = JSON.parse(data) as Config;
			type = 'json';
		}
		catch {
			context.config = yaml.parse(data) as Config;
			type = 'yaml';
		}
	}

	context.configInfo = {
		name: name!,
		type,
		finalNewLine,
	};
}
