import { Command } from '@zokugun/cli-utils/commander';
import pkg from '../package.json';
import { add, list, remove, update } from './commands/index.js';

const program = new Command();

program
	.version(pkg.version, '-V, --version')
	.description(pkg.description);

program
	.command('add')
	.description('add an artifact to the current project')
	.option('-d, --dry-run', 'fake install')
	.option('-v, --verbose', 'output more details')
	.argument('<artifacts...>')
	.action(add);

program
	.command('update')
	.description('update the current project using the installed artifacts')
	.option('-d, --dry-run', 'fake update')
	.option('-v, --verbose', 'output more details')
	.alias('up')
	.action(update);

program
	.command('remove')
	.description('remove an artifact from the current project')
	.option('-d, --dry-run', 'fake uninstall')
	.option('-v, --verbose', 'output more details')
	.argument('<artifacts...>')
	.alias('rm')
	.action(remove);

program
	.command('list')
	.description('list the installed artifacts in the project')
	.alias('l')
	.action(list);

program.parse();
