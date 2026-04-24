import { type AsyncDResult, OK } from '@zokugun/xtry';
import { type Context } from '../types/context.js';
import { TemplateEngine } from '../utils/template.js';

export async function replaceTemplates({ textFiles, binaryFiles, targetPath, config, incomingConfig, options }: Context): AsyncDResult {
	const variables = {
		...incomingConfig?.variables,
		...config?.variables,
		...options.variables,
	};

	const engine = new TemplateEngine(targetPath, variables);

	for(const file of textFiles) {
		const dataResult = engine.render(file.data);
		if(dataResult.fails) {
			return dataResult;
		}

		const nameResult = engine.render(file.name);
		if(nameResult.fails) {
			return nameResult;
		}

		file.data = dataResult.value;
		file.name = nameResult.value;
	}

	for(const file of binaryFiles) {
		const targetResult = engine.render(file.target);
		if(targetResult.fails) {
			return targetResult;
		}

		file.target = targetResult.value;
	}

	return OK;
}
