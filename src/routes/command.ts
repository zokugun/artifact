import { splitCommand, joinCommand } from '../utils/command';
import { hash } from './hash';

export function command({ current, incoming }: { current: string | undefined; incoming: string | undefined }): string {
	if(!incoming) {
		return current ?? '';
	}

	if(!current) {
		return incoming;
	}

	const currentCommand = splitCommand(current);
	const incomingCommand = splitCommand(incoming);

	const result = hash({
		current: currentCommand,
		incoming: incomingCommand,
	});

	return joinCommand(result);
}
