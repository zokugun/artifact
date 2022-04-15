import path from 'path';
import fse from 'fs-extra';
import { getJourney } from '../journeys';
import { Context } from '../types/context';

export async function mergeTextFiles({ targetPath, textFiles, mergedTextFiles, onMissing, onUpdate, filters, routes, options }: Context): Promise<void> {
	for(const file of textFiles) {
		if(options.verbose) {
			console.log(`${file.name} is going to be merged`);
		}

		const journey = routes(file.name) ?? getJourney(file.name);

		if(!journey) {
			if(options.verbose) {
				console.log(`${file.name}, no merger has been found`);
			}

			try {
				await fse.access(path.join(targetPath, file.name));

				if(onUpdate(file.name)) {
					continue;
				}
			}
			catch {
				if(onMissing(file.name)) {
					continue;
				}
			}

			mergedTextFiles.push(file);
			continue;
		}

		if(options.verbose) {
			console.log(`${file.name}, a merger has been found`);
		}

		const name = journey.alias ? path.join(path.dirname(file.name), journey.alias) : file.name;

		let currentData: string | undefined;

		try {
			currentData = await fse.readFile(path.join(targetPath, name), 'utf-8');

			if(onUpdate(name)) {
				continue;
			}
		}
		catch {
			if(onMissing(name)) {
				continue;
			}
		}

		const data = journey.travel({
			current: currentData,
			incoming: file.data,
			filters: filters(file.name),
		})!;

		mergedTextFiles.push({
			name,
			data,
			finalNewLine: file.finalNewLine,
			mode: file.mode,
		});

		if(options.verbose) {
			console.log(`${file.name} has been merged`);
		}
	}
}
