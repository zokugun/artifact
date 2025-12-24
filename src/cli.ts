import { Command } from 'commander';
import pkg from '../package.json';
import { add, list, update } from './commands';

const program = new Command();

program
	.version(pkg.version, '-V, --version')
	.description(pkg.description);

program
	.command('add')
	.description('add an artifact to the current project')
	.option('-v, --verbose', 'output more details')
	.argument('<artifacts...>')
	.action(add);

program
	.command('update')
	.description('update the current project using the installed artifacts')
	.option('-v, --verbose', 'output more details')
	.alias('up')
	.action(update);

program
	.command('list')
	.description('list the installed artifacts in the project')
	.alias('l')
	.action(list);

program.parse();
