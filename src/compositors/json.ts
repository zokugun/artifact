import { flow, isPlainObject } from 'lodash';
import { Route } from '../types/travel';
import * as JSON from '../parsers/json';
import * as JSONC from '../parsers/jsonc';
import { listConcat, mapConcat, primitive } from '../routes';
import { Transform } from '../parsers/jsonc/transform';
import { compose } from './compose';
import { fork } from './fork';

function tryJson(value: string): Record<string, any> | undefined {
	try {
		return JSON.parse(value);
	}
	catch {
		return undefined;
	}
}

const merge = compose({
	$$default: fork(
		[Array.isArray, listConcat],
		[isPlainObject, mapConcat],
		primitive,
	),
});

export function json(...routes: Array<Route<Record<string, any>>>): Route<string> {
	return ({ current, incoming, filters, ignores }) => {
		const currentData = current && tryJson(current);
		const incomingData = incoming && tryJson(incoming);

		if((!current || currentData) && (!incoming || incomingData)) {
			return flow(...routes, JSON.stringify)({ current: currentData, incoming: incomingData, filters, ignores }) as string;
		}
		else {
			const { data: currentData, transform: currentTransform } = JSONC.parse(current) as { data: Record<string, any> | undefined; transform: Transform | undefined };
			const { data: incomingData, transform: incomingTransform } = JSONC.parse(incoming) as { data: Record<string, any> | undefined; transform: Transform | undefined };
			const mergedTransform = merge({ current: currentTransform, incoming: incomingTransform });
			const toJSON = (data: Record<string, any>) => JSONC.stringify(data, mergedTransform);

			return flow(...routes, toJSON)({ current: currentData, incoming: incomingData, filters, ignores }) as string;
		}
	};
}
