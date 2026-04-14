import { type FileTransform } from './config.js';

export type Args<T> = { current: T | undefined; incoming: T | undefined; filters?: string[]; ignores?: string[]; transforms?: FileTransform[] };

export type Route<T> = (args: Args<T>) => Promise<T>;

export type TravelPlan = (basename: string) => Route<string> | undefined;

export type Journey = {
	alias?: string;
	travel: Route<string>;
};
