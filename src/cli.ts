import { Command } from 'commander';
import pkg from '../package.json';
import { add, update } from './commands';

const program = new Command();

program
	.version(pkg.version, '-v, --version')
	.description(pkg.description);

program
	.command('add')
	.description('add an artifact to the current project')
	.option('-v, --verbose', 'output more details')
	.argument('<artifacts...>')
	.action(add);

program
	.command('update')
	.description('update the current project using the installed artifact')
	.option('-v, --verbose', 'output more details')
	.action(update);

program.parse();
