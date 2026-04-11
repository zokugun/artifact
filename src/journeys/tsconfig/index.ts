import { isPlainObject } from 'lodash-es';
import { compose, fork, json } from '../../compositors/index.js';
import { listConcat, mapConcat, primitive } from '../../routes/index.js';
import { buildJourneyPlan } from '../../utils/build-journey-plan.js';
import { buildTravelPlan } from '../../utils/build-travel-plan.js';

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
