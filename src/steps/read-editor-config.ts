import path from 'path';
import * as editorconfig from 'editorconfig';
import fse from 'fs-extra';
import { Context } from '../types/context';
import { IndentStyle } from '../types/format';

function buildFullGlob(glob: string) { // {{{
	switch(glob.indexOf('/')) {
		case -1:
			glob = '**/' + glob;
			break;
		case 0:
			glob = glob.slice(1);
			break;
		default:
			break;
	}

	return glob.replace(/\*\*/g, '{*,**/**/**}');
} // }}}

export async function readEditorConfig({ incomingPath, targetPath, formats }: Context): Promise<void> {
	let data;

	try {
		const dir = path.join(incomingPath, 'configs');
		const file = path.join(dir, '.editorconfig');

		data = await fse.readFile(file, 'utf-8');
	}
	catch {
	}

	if(!data) {
		try {
			const file = path.join(targetPath, '.editorconfig');

			data = await fse.readFile(file, 'utf-8');
		}
		catch {
		}
	}

	if(!data) {
		return;
	}

	const rules = editorconfig.parseString(data);

	for(const [glob, rule] of rules) {
		if(!glob) {
			continue;
		}

		const indentStyle = (rule.indent_style || 'space') as IndentStyle;
		const indentSize = (rule.indent_size && Number.parseInt(rule.indent_size, 10)) || 2;
		const insertFinalNewline = typeof rule.insert_final_newline === 'undefined' ? true : rule.insert_final_newline === 'true';

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
}
