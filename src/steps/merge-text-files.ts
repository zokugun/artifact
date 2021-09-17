import path from 'path';
import fse from 'fs-extra';
import { Context } from '../types/context';
import { getJourney } from '../journeys';

export async function mergeTextFiles({ targetPath, textFiles, mergedTextFiles, options }: Context): Promise<void> {
	for(const file of textFiles) {
		if(file.data.length === 0) {
			mergedTextFiles.push(file);
			continue;
		}

		const journey = getJourney(file.name);

		if(!journey) {
			if(options.verbose) {
				console.log(`${file.name}, no merger found`);
			}

			mergedTextFiles.push(file);
			continue;
		}

		const name = journey.alias ? path.join(path.dirname(file.name), journey.alias) : file.name;

		let currentData: string | undefined;

		try {
			currentData = await fse.readFile(path.join(targetPath, name), 'utf-8');
		}
		catch {
		}

		const data = journey.travel({
			current: currentData,
			incoming: file.data,
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
