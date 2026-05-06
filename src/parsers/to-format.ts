import { type Codec } from '../types/context.js';
import * as JSON from './json.js';
import * as JSONC from './jsonc/index.js';
import * as YAML from './yaml.js';

export function toFormat(value: 'json' | 'jsonc' | 'yaml'): Codec {
	if(value === 'json') {
		return JSON;
	}
	else if(value === 'yaml') {
		return YAML;
	}
	else {
		return JSONC;
	}
}
