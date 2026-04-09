import { isEqual } from 'lodash';
import { listConcat } from '../../routes/list-concat';
import { Command } from '../../types/command';

export function mergeCommandRecords(currentCommand: Record<string, Command[]>, incomingCommand: Record<string, Command[]>, currentString: string): Record<string, Command[]> {
	const result: Record<string, Command[]> = {};

	// Start with current commands to preserve ordering
	for(const [name, instances] of Object.entries(currentCommand)) {
		result[name] = instances.slice();
	}

	// Merge incoming into existing result, preserving order
	for(const [name, instances] of Object.entries(incomingCommand)) {
		if(result[name]) {
			for(const [idx, instance] of instances.entries()) {
				if(result[name][idx]) {
					const currentInstance = result[name][idx];

					const hasFlags = (array: string[]) => array.some((a) => a.startsWith('-') || a.includes('='));
					const getPrefix = (array: string[]) => {
						const ii = array.findIndex((a) => a.startsWith('-'));
						if(ii === -1) {
							return array.join(' ').trim();
						}

						return array.slice(0, ii).join(' ').trim();
					};

					const currentPrefix = getPrefix(currentInstance.args);
					const incomingPrefix = getPrefix(instance.args);

					const shouldMerge = currentPrefix && incomingPrefix && currentPrefix === incomingPrefix && (hasFlags(currentInstance.args) || hasFlags(instance.args) || (currentInstance.env.length > 0) || (instance.env.length > 0));

					if(shouldMerge) {
						// replace with merged instance
						result[name][idx] = {
							args: listConcat({ current: currentInstance.args, incoming: instance.args }) as string[],
							env: listConcat({ current: currentInstance.env, incoming: instance.env }) as string[],
							separator: instance.separator ?? currentInstance.separator,
						};
					}
					else {
						// If incoming instance is empty (no args/env), skip it to avoid duplicates
						if((instance.args.length === 0) && (instance.env.length === 0)) {
							// keep current as-is
							result[name][idx] = currentInstance;
						}
						else if(isEqual(currentInstance.env, instance.env)
							&& instance.args.length > 0
							&& instance.args.every((arg) => currentInstance.args.includes(arg))) {
							// Incoming is a strict subset of current args for the same command/env.
							result[name][idx] = currentInstance;
						}
						else {
							// avoid inserting exact duplicate instances
							const duplicateExists = result[name].some((r) => isEqual(r.args, instance.args) && isEqual(r.env, instance.env));
							if(duplicateExists) {
								// nothing to do, keep current ordering
								result[name][idx] = currentInstance;
							}
							else {
								// insert incoming as separate after current
								const currentWithSep = { ...currentInstance, separator: currentInstance.separator ?? (currentString.includes('&&') ? '&&' : ';') };
								result[name][idx] = currentWithSep;
								result[name].splice(idx + 1, 0, instance);
							}
						}
					}
				}
				else {
					result[name].push(instance);
				}
			}
		}
		else {
			// incoming-only: append
			result[name] = instances.slice();
		}
	}

	// Include current-only entries that weren't present in incoming
	for(const [name, instances] of Object.entries(currentCommand)) {
		if(!result[name]) {
			result[name] = instances;
		}
	}

	return result;
}
