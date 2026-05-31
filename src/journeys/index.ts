import path from '@zokugun/fs-extra-plus/path';
import { type JourneyPlan, type Journey } from '../types/travel.js';
import commitlintJourney from './commitlint/index.js';
import configTSJourney from './config.ts/index.js';
import defaultJourney from './default/index.js';
import gitignoreJourney from './gitignore/index.js';
import ignoreJourney from './ignore/index.js';
import npmignoreJourney from './npmignore/index.js';
import packageJourney from './package/index.js';
import rcJourney from './rc/index.js';
import tsConfigJourney from './tsconfig/index.js';

const DEFAULT_PLANS = [
	commitlintJourney,
	gitignoreJourney,
	ignoreJourney,
	npmignoreJourney,
	packageJourney,
	tsConfigJourney,
	rcJourney,
	configTSJourney,
	defaultJourney,
];

export function getJourney(filename: string, plans: JourneyPlan[] = DEFAULT_PLANS): Journey | undefined {
	const basename = path.leafName(filename);

	for(const plan of plans) {
		const journey = plan(basename);

		if(journey) {
			return journey;
		}
	}

	return undefined;
}
