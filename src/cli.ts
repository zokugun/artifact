import { Command } from 'commander';
import pkg from '../package.json';
import { add } from './commands/add';

const program = new Command();

program.version(pkg.version);

program
	.command('add')
	.description('add an artifact to the current project')
	.option('-v, --verbose', 'output more details')
	.argument('<artifacts...>')
	.action(add);

program.parse();
