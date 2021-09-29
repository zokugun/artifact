import { head, identity, last, trim } from 'lodash';
import { Command } from '../../types/command';

export function splitCommand(command: string): Record<string, Command[]> {
	const result: Record<string, Command[]> = {};

	const splitted = command.split(/([&|]{1,2}|;)/).map(trim);

	for(let i = 0; i < splitted.length; i++) {
		const command = splitted[i];
		const splittedSubcommand = command.split(/([\w-]+=\S+)\s/).filter(identity);
		const subcommandWithArgs = last(splittedSubcommand)!.split(' ');
		const subcommand = head(subcommandWithArgs)!.trim();
		const args = subcommandWithArgs.slice(1);
		const env = splittedSubcommand.slice(0, -1);

		const parsedSubcommand: Command = {
			args: args.map(trim),
			env: env.map(trim),
			separator: splitted[i + 1],
		};

		if(result[subcommand]) {
			result[subcommand].push(parsedSubcommand);
		}
		else {
			result[subcommand] = [parsedSubcommand];
		}

		i++;
	}

	return result;
}
