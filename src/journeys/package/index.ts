import isPlainObject from 'lodash/isPlainObject';
import { compose, fork, json } from '../../compositors';
import { command, hash, listConcat, primitive } from '../../routes';
import { buildJourneyPlan } from '../../utils/build-journey-plan';
import { buildTravelPlan } from '../../utils/build-travel-plan';

const mainRoute = compose({
	// default fields
	keywords: listConcat,
	homepage: primitive,
	bugs: fork(
		[isPlainObject, hash],
		primitive,
	),
	license: fork(
		[isPlainObject, hash],
		primitive,
	),
	licenses: listConcat,
	author: fork(
		[isPlainObject, hash],
		primitive,
	),
	repository: fork(
		[isPlainObject, hash],
		primitive,
	),
	scripts: compose({
		$$default: command,
	}),
	config: hash,
	engines: hash,
	dependencies: hash,
	devDependencies: hash,
	peerDependencies: hash,
	optionalDependencies: hash,
	bundledDependencies: hash,

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
		[isPlainObject, hash],
		primitive,
	),
});

const jsonRoute = json(mainRoute);

const travelPlan = buildTravelPlan(
	['package.json', jsonRoute],
);

export default buildJourneyPlan(travelPlan);
