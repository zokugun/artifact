import path from 'path';
import fse from 'fs-extra';
import { getJourney } from '../journeys';
import { Context } from '../types/context';

export async function mergeTextFiles({ targetPath, textFiles, mergedTextFiles, onExisting, onMissing, filters, routes, options }: Context): Promise<void> {
	for(const file of textFiles) {
		if(options.verbose) {
			console.log(`${file.name} is going to be merged`);
		}

		const journey = routes(file.name) ?? getJourney(file.name);

		if(!journey) {
			if(options.verbose) {
				console.log(`${file.name}, no merger has been found`);
			}

			const filePath = path.join(targetPath, file.name);
			const exists = await fse.pathExists(filePath);

			if(exists) {
				switch(onExisting(file.name)) {
					case 'merge':
						break;
					case 'overwrite':
						break;
					case 'skip':
						continue;
				}
			}
			else {
				switch(onMissing(file.name)) {
					case 'continue':
						break;
					case 'skip':
						continue;
				}
			}

			mergedTextFiles.push(file);

			if(options.verbose) {
				console.log(`${file.name} has been copied`);
			}

			continue;
		}

		if(options.verbose) {
			console.log(`${file.name}, a merger has been found`);
		}

		const fileName = journey.alias ? path.join(path.dirname(file.name), journey.alias) : file.name;
		const filePath = path.join(targetPath, fileName);
		const exists = await fse.pathExists(filePath);

		if(exists) {
			switch(onExisting(file.name)) {
				case 'merge': {
					const currentData = await fse.readFile(filePath, 'utf-8');
					const data = journey.travel({
						current: currentData,
						incoming: file.data,
						filters: filters(file.name),
					})!;

					mergedTextFiles.push({
						name: fileName,
						data,
						finalNewLine: file.finalNewLine,
						mode: file.mode,
					});

					if(options.verbose) {
						console.log(`${file.name} has been merged`);
					}

					break;
				}

				case 'overwrite':
					mergedTextFiles.push(file);

					if(options.verbose) {
						console.log(`${file.name} has been overwritten`);
					}

					continue;
				case 'skip':
					continue;
			}
		}
		else {
			switch(onMissing(file.name)) {
				case 'continue':
					mergedTextFiles.push({
						...file,
						name: fileName,
					});

					if(options.verbose) {
						console.log(`${file.name} has been copied`);
					}

					continue;
				case 'skip':
					continue;
			}
		}
	}
}
