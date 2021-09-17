export type Args<T> = { current: T | undefined; incoming: T | undefined; ignores?: string[] };

export type Route<T> = (args: Args<T>) => T;

export type TravelPlan = (basename: string) => Route<string> | undefined;

export interface Journey {
	alias?: string;
	travel: Route<string>;
}
