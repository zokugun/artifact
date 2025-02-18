import { Context } from '../types/context';
import { TemplateEngine } from '../utils/template';

export async function replaceTemplates({ textFiles, binaryFiles, targetPath }: Context): Promise<void> {
	const engine = new TemplateEngine(targetPath);

	for(const file of textFiles) {
		file.data = engine.render(file.data);
		file.name = engine.render(file.name);
	}

	for(const file of binaryFiles) {
		file.target = engine.render(file.target);
	}
}
