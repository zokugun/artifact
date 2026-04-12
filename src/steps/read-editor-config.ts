import path from 'path';
import fse from '@zokugun/fs-extra-plus/async';
import { type AsyncDResult, OK } from '@zokugun/xtry';
import * as editorconfig from 'editorconfig';
import { type Context } from '../types/context.js';
import { IndentStyle } from '../types/format.js';

function buildFullGlob(glob: string) { // {{{
	switch(glob.indexOf('/')) {
		case -1: {
			glob = '**/' + glob;
			break;
		}

		case 0: {
			glob = glob.slice(1);
			break;
		}

		default: {
			break;
		}
	}

	return glob.replaceAll('**', '{*,**/**/**}');
} // }}}

export async function readEditorConfig({ incomingPath, targetPath, formats }: Context): AsyncDResult {
	const incomingFile = path.join(incomingPath, 'configs', '.editorconfig');

	let readResult = await fse.readFile(incomingFile, 'utf8');

	if(readResult.fails) {
		const targetFile = path.join(targetPath, '.editorconfig');

		readResult = await fse.readFile(targetFile, 'utf8');
	}

	if(readResult.fails) {
		return OK;
	}

	const rules = editorconfig.parseString(readResult.value);

	for(const [glob, rule] of rules) {
		if(!glob) {
			continue;
		}

		const indentStyle = (rule.indent_style || 'space') as IndentStyle;
		const indentSize = (rule.indent_size && Number.parseInt(rule.indent_size, 10)) || 2;
		const insertFinalNewline = rule.insert_final_newline === undefined ? true : rule.insert_final_newline === 'true';

		formats.push({
			glob: buildFullGlob(glob),
			indentStyle,
			indentSize,
			insertFinalNewline,
		});
	}

	formats.push({
		glob: buildFullGlob('{*.yml,*.yaml}'),
		indentStyle: IndentStyle.SPACE,
		indentSize: 2,
		insertFinalNewline: true,
	});

	formats.reverse();

	return OK;
}
