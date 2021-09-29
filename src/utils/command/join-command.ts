import { Command } from '../../types/command';

export function joinCommand(commands: Record<string, Command[]>): string {
	const subcommands = [] as string[];

	for(const [key, values] of Object.entries(commands)) {
		if(values.length === 0) {
			subcommands.push(key);
			continue;
		}

		for(const value of values) {
			let subcommand = key;

			if(value.env.length > 0) {
				subcommand = `${value.env.join(' ')} ${subcommand}`;
			}

			if(value.args.length > 0) {
				subcommand = `${subcommand} ${value.args.join(' ')}`;
			}

			if(value.separator) {
				if(value.separator === ';') {
					subcommand += ';';
				}
				else {
					subcommand = `${subcommand} ${value.separator}`;
				}
			}

			subcommands.push(subcommand);
		}
	}

	return subcommands.join(' ');
}
