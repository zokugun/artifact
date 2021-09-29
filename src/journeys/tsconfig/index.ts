import isPlainObject from 'lodash/isPlainObject';
import { compose, fork, json } from '../../compositors';
import { listConcat, mapConcat, primitive } from '../../routes';
import { buildJourneyPlan } from '../../utils/build-journey-plan';
import { buildTravelPlan } from '../../utils/build-travel-plan';

const mainRoute = compose({
	compilerOptions: compose({
		lib: listConcat,

		$$default: fork(
			[Array.isArray, listConcat],
			[isPlainObject, mapConcat],
			primitive,
		),
	}),

	$$default: fork(
		[Array.isArray, listConcat],
		[isPlainObject, mapConcat],
		primitive,
	),
});

const jsonRoute = json(mainRoute);

const travelPlan = buildTravelPlan(
	[/tsconfig(?:\.\w+)?\.json$/, jsonRoute],
);

export default buildJourneyPlan(travelPlan);
