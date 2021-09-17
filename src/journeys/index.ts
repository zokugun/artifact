import path from 'path';
import { Journey } from '../types/travel';
import commitlintJourney from './commitlint';
import defaultJourney from './default';
import gitignoreJourney from './gitignore';
import ignoreJourney from './ignore';
import npmignoreJourney from './npmignore';
import packageJourney from './package';
import rcJourney from './rc';

const plans = [
	packageJourney,
	gitignoreJourney,
	npmignoreJourney,
	ignoreJourney,
	commitlintJourney,
	rcJourney,
	defaultJourney,
];

export function getJourney(filename: string): Journey | undefined {
	const basename = path.basename(filename);

	for(const plan of plans) {
		const journey = plan(basename);
		if(journey) {
			return journey;
		}
	}

	return undefined;
}
