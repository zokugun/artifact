import isPlainObject from 'lodash/isPlainObject';
import { compose, fork, json } from '../../compositors';
import { command, listConcat, mapConcat, primitive } from '../../routes';
import { buildJourneyPlan } from '../../utils/build-journey-plan';
import { buildTravelPlan } from '../../utils/build-travel-plan';

const mainRoute = compose({
	// default fields
	keywords: listConcat,
	homepage: primitive,
	bugs: fork(
		[isPlainObject, mapConcat],
		primitive,
	),
	license: fork(
		[isPlainObject, mapConcat],
		primitive,
	),
	licenses: listConcat,
	author: fork(
		[isPlainObject, mapConcat],
		primitive,
	),
	repository: fork(
		[isPlainObject, mapConcat],
		primitive,
	),
	scripts: compose({
		$$default: command,
	}),
	config: mapConcat,
	engines: mapConcat,
	dependencies: mapConcat,
	devDependencies: mapConcat,
	peerDependencies: mapConcat,
	optionalDependencies: mapConcat,
	bundledDependencies: mapConcat,

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
		'private',
	],
	$$default: fork(
		[Array.isArray, listConcat],
		[isPlainObject, mapConcat],
		primitive,
	),
});

const jsonRoute = json(mainRoute);

const travelPlan = buildTravelPlan(
	['package.json', jsonRoute],
);

export default buildJourneyPlan(travelPlan);
