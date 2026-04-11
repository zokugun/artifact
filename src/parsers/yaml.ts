import yaml from 'yaml';

export function parse(data: string): Record<string, unknown> {
	return yaml.parse(data) as Record<string, unknown>;
}

export function stringify(data: Record<string, unknown>): string {
	return yaml.stringify(data);
}
