import path from 'path';
import fse from 'fs-extra';
import yaml from 'yaml';
import { InstallConfig, InstallConfigStats, OldInstallConfig } from '../../types/config';

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

export async function readInstallConfig(targetPath: string): Promise<{ config: InstallConfig; configStats: InstallConfigStats }> {
	let content: string | undefined;
	let name: string;
	let type: string | undefined;

	for(const place of places) {
		try {
			content = await fse.readFile(path.join(targetPath, place.name), 'utf-8');

			name = place.name;
			type = place.type;

			break;
		}
		catch {
		}
	}

	if(!content) {
		return {
			config: {
				artifacts: {},
				install: {},
				update: {},
			},
			configStats: {
				name: '.artifactrc.yml',
				type: 'yaml',
				finalNewLine: true,
			},
		};
	}

	const finalNewLine = content.endsWith('\n');

	let data: InstallConfig | OldInstallConfig;
	if(type === 'json') {
		data = JSON.parse(content) as InstallConfig | OldInstallConfig;
	}
	else if(type === 'yaml') {
		data = yaml.parse(content) as InstallConfig | OldInstallConfig;
	}
	else {
		try {
			data = JSON.parse(content) as InstallConfig | OldInstallConfig;
			type = 'json';
		}
		catch {
			data = yaml.parse(content) as InstallConfig | OldInstallConfig;
			type = 'yaml';
		}
	}

	if(typeof data.update === 'undefined') {
		data.update = {};
	}

	if(isOldInstallConfig(data)) {
		const config = {
			artifacts: {},
			install: data.install,
			update: data.update,
		};

		for(const { name, version } of data.artifacts) {
			config.artifacts[name] = {
				version,
			};
		}

		return {
			config,
			configStats: {
				name: name!,
				type,
				finalNewLine,
			},
		};
	}
	else {
		return {
			config: data,
			configStats: {
				name: name!,
				type,
				finalNewLine,
			},
		};
	}
}

function isOldInstallConfig(config: InstallConfig | OldInstallConfig): config is OldInstallConfig {
	return Array.isArray(config.artifacts);
}
