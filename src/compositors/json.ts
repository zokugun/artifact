import { JSON, JSONC } from '../parsers/index.js';
import { type Route } from '../types/travel.js';
import { codec } from './codec.js';

export function json(...routes: Array<Route<Record<string, any>>>): Route<string> {
	return codec([JSON, JSONC], ...routes);
}
