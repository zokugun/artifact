import { Command } from '@zokugun/cli-utils/commander';
import pkg from '../package.json' with { type: 'json' };
import { add, list, outdated, remove, update, version, selfUpgrade } from './commands/index.js';

const program = new Command();

program
	.version(pkg.version, '-v, --version')
	.description(pkg.description);

program
	.command('add')
	.description('add an artifact to the current project')
	.option('--age, --min-release-age <hours>', 'minimum age in hours of artifacts to allow update', Number)
	.option('-d, --dry-run', 'fake install')
	.option('--verbose', 'output more details')
	.option(
		'--var <name=value>',
		'pass a variable (format: name=value), repeatable',
		(pair: string, previous: Array<{ name: string; value: string }> = []) => {
			const index = pair.indexOf('=');

			if(index === -1) {
				throw new Error('--var expects format name=value');
			}

			const name = pair.slice(0, index);
			const value = pair.slice(index + 1);

			previous.push({ name, value });

			return previous;
		},
		[],
	)
	.argument('<artifacts...>')
	.action(add);

program
	.command('list')
	.description('list the installed artifacts in the project')
	.alias('ls')
	.action(list);

program
	.command('outdated')
	.description('check for outdated artifacts')
	.alias('od')
	.action(outdated);

program
	.command('remove')
	.description('remove an artifact from the current project')
	.option('-d, --dry-run', 'fake uninstall')
	.option('--verbose', 'output more details')
	.argument('[artifacts...]')
	.alias('rm')
	.action(remove);

program
	.command('self-upgrade')
	.description('upgrade to the latest version')
	.option('--age, --min-release-age <hours>', 'minimum age in hours of release to allow upgrade', Number)
	.alias('seg')
	.action(selfUpgrade);

program
	.command('update')
	.description('update the current project using the installed artifacts')
	.option('--age, --min-release-age <hours>', 'minimum age in hours of artifacts to allow update', Number)
	.option('-d, --dry-run', 'fake update')
	.option('--verbose', 'output more details')
	.alias('up')
	.action(update);

program
	.command('version')
	.description('display the installed and latest versions')
	.action(version);

program.parse();
