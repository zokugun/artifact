export const CONFIG_LOCATIONS = [
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

export const MAX_VERSION = 2;
export const VERSION_INSTALL_REGEX = /https:\/\/raw.githubusercontent.com\/zokugun\/artifact\/v([\d.]+)\/schemas\/v(\d+)\/install.json/;
export const VERSION_PACKAGE_REGEX = /https:\/\/raw.githubusercontent.com\/zokugun\/artifact\/v([\d.]+)\/schemas\/v(\d+)\/package.json/;
export const VERSION_RELEASE = '0.9.0';
