import yaml from 'yaml';

export function parse(data: string): Record<string, any> {
	return yaml.parse(data) as Record<string, any>;
}

export function stringify(data: Record<string, any>): string {
	return yaml.stringify(data);
}
