import { type Context } from '../types/context.js';
import { TemplateEngine } from '../utils/template.js';

export async function replaceTemplates({ textFiles, binaryFiles, targetPath, config, incomingConfig }: Context): Promise<void> {
	const variables = {
		...incomingConfig?.variables,
		...config?.variables,
		...incomingConfig?.constants,
		...config?.constants,
	};
	const engine = new TemplateEngine(targetPath, variables);

	for(const file of textFiles) {
		file.data = engine.render(file.data);
		file.name = engine.render(file.name);
	}

	for(const file of binaryFiles) {
		file.target = engine.render(file.target);
	}
}
