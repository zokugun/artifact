import { splitCommand, joinCommand, Command } from '../utils/command';
import { listConcat } from './list-concat';

export function command({ current, incoming }: { current: string | undefined; incoming: string | undefined }): string {
	if(!incoming) {
		return current ?? '';
	}

	if(!current) {
		return incoming;
	}

	const currentCommand = splitCommand(current);
	const incomingCommand = splitCommand(incoming);

	const result: Record<string, Command[]> = {};

	for(const [name, instances] of Object.entries(incomingCommand)) {
		if(currentCommand[name]) {
			result[name] = [];

			for(const [index, instance] of instances.entries()) {
				if(currentCommand[name][index]) {
					const currentInstance = currentCommand[name][index];

					result[name].push({
						args: listConcat({
							current: currentInstance.args,
							incoming: instance.args,
						}) as string[],
						env: listConcat({
							current: currentInstance.env,
							incoming: instance.env,
						}) as string[],
						separator: instance.separator ?? currentInstance.separator,
					});
				}
				else {
					result[name].push(instance);
				}
			}
		}
		else {
			result[name] = instances;
		}
	}

	return joinCommand(result);
}
