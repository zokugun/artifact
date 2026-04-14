import { isEqual } from 'lodash-es';
import { listConcat } from '../../routes/list-concat.js';
import { type Command } from '../../types/command.js';

export async function mergeCommandRecords(currentCommand: Record<string, Command[]>, incomingCommand: Record<string, Command[]>, currentString: string): Promise<Record<string, Command[]>> {
	const result: Record<string, Command[]> = {};

	// Start with current commands to preserve ordering
	for(const [name, instances] of Object.entries(currentCommand)) {
		result[name] = [...instances];
	}

	// Merge incoming into existing result, preserving order
	for(const [name, instances] of Object.entries(incomingCommand)) {
		if(result[name]) {
			for(const [index, instance] of instances.entries()) {
				if(result[name][index]) {
					const currentInstance = result[name][index];

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
						result[name][index] = {
							args: await listConcat({ current: currentInstance.args, incoming: instance.args }) as string[],
							env: await listConcat({ current: currentInstance.env, incoming: instance.env }) as string[],
							separator: instance.separator ?? currentInstance.separator,
						};
					}
					else {
						// If incoming instance is empty (no args/env), skip it to avoid duplicates
						if((instance.args.length === 0) && (instance.env.length === 0)) {
							// keep current as-is
							result[name][index] = currentInstance;
						}
						else if(isEqual(currentInstance.env, instance.env)
							&& instance.args.length > 0
							&& instance.args.every((arg) => currentInstance.args.includes(arg))) {
							// Incoming is a strict subset of current args for the same command/env.
							result[name][index] = currentInstance;
						}
						else {
							// avoid inserting exact duplicate instances
							const duplicateExists = result[name].some((r) => isEqual(r.args, instance.args) && isEqual(r.env, instance.env));
							if(duplicateExists) {
								// nothing to do, keep current ordering
								result[name][index] = currentInstance;
							}
							else if(!hasFlags(currentInstance.args)
								&& !hasFlags(instance.args)
								&& currentInstance.env.length === 0
								&& instance.env.length === 0
								&& currentPrefix !== incomingPrefix) {
								// Different singleton-like invocations of the same command should not be interleaved.
								const lastIndex = result[name].length - 1;
								const last = result[name][lastIndex];
								if(last && !last.separator) {
									last.separator = currentString.includes('&&') ? '&&' : ';';
								}

								result[name].push(instance);
							}
							else {
								// insert incoming as separate after current
								const currentWithSeparator = { ...currentInstance, separator: currentInstance.separator ?? (currentString.includes('&&') ? '&&' : ';') };
								result[name][index] = currentWithSeparator;
								result[name].splice(index + 1, 0, instance);
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
			const previousNames = Object.keys(result);
			const previousName = previousNames.at(-1);
			const isPlainSequence = !currentString.includes('&&') && !currentString.includes('||') && !currentString.includes(';');

			if(isPlainSequence && previousName) {
				const previousInstances = result[previousName];
				const lastPrevious = previousInstances.at(-1);

				if(lastPrevious && !lastPrevious.separator) {
					lastPrevious.separator = ';';
				}
			}

			result[name] = [...instances];
		}
	}

	// Include current-only entries that weren't present in incoming
	for(const [name, instances] of Object.entries(currentCommand)) {
		result[name] ||= instances;
	}

	return result;
}
