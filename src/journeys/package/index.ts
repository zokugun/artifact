import { isArray, isRecord } from '@zokugun/is-it-type';
import { compose, fork, json, mapSort } from '../../compositors/index.js';
import { command, listConcat, mapConcat, primitive } from '../../routes/index.js';
import { buildJourneyPlan } from '../../utils/build-journey-plan.js';
import { buildTravelPlan } from '../../utils/build-travel-plan.js';

const mainRoute = compose({
	// default fields
	keywords: listConcat,
	homepage: primitive,
	bugs: fork(
		[isRecord, mapConcat],
		primitive,
	),
	license: fork(
		[isRecord, mapConcat],
		primitive,
	),
	licenses: listConcat,
	author: fork(
		[isRecord, mapConcat],
		primitive,
	),
	repository: fork(
		[isRecord, mapConcat],
		primitive,
	),
	scripts: mapSort(compose({
		$$default: command,
	})),
	config: mapSort(mapConcat),
	engines: mapSort(mapConcat),
	dependencies: mapSort(mapConcat),
	devDependencies: mapSort(mapConcat),
	peerDependencies: mapSort(mapConcat),
	optionalDependencies: mapSort(mapConcat),
	bundledDependencies: mapSort(mapConcat),

	// tools fields
	browserslist: listConcat,

	// other fields
	$$ignore: [
		'name',
		'version',
		'description',
		'people',
		'man',
		'os',
		'cpu',
		'preferGlobal',
	],
	$$default: fork(
		[isArray, listConcat],
		[isRecord, mapConcat],
		primitive,
	),
});

const jsonRoute = json(mainRoute);

const travelPlan = buildTravelPlan(
	['package.json', jsonRoute],
);

export default buildJourneyPlan(travelPlan);
