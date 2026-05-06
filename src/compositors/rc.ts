import { JSON, YAML } from '../parsers/index.js';
import { type Route } from '../types/travel.js';
import { codec } from './codec.js';

export function rc(...routes: Array<Route<Record<string, any>>>): Route<string> {
	return codec([JSON, YAML], ...routes);
}
