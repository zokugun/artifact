import path from 'path';
import { Journey } from '../types/travel';
import commitlintJourney from './commitlint';
import configTSJourney from './config.ts';
import defaultJourney from './default';
import fixpackJourney from './fixpack';
import gitignoreJourney from './gitignore';
import ignoreJourney from './ignore';
import npmignoreJourney from './npmignore';
import packageJourney from './package';
import rcJourney from './rc';
import tsConfigJourney from './tsconfig';

const plans = [
	commitlintJourney,
	fixpackJourney,
	gitignoreJourney,
	ignoreJourney,
	npmignoreJourney,
	packageJourney,
	tsConfigJourney,
	rcJourney,
	configTSJourney,
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
