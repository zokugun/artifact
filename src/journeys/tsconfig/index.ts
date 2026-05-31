import { isArray, isRecord } from '@zokugun/is-it-type';
import { compose, fork, json } from '../../compositors/index.js';
import { listConcat, mapConcat, primitive } from '../../routes/index.js';
import { buildJourneyPlan } from '../../utils/build-journey-plan.js';
import { buildTravelPlan } from '../../utils/build-travel-plan.js';

const mainRoute = compose({
	compilerOptions: compose({
		lib: listConcat,

		$$default: fork(
			[isArray, listConcat],
			[isRecord, mapConcat],
			primitive,
		),
	}),

	$$default: fork(
		[isArray, listConcat],
		[isRecord, mapConcat],
		primitive,
	),
});

const jsonRoute = json(mainRoute);

const travelPlan = buildTravelPlan(
	[/tsconfig(?:\.\w+)?\.json$/, jsonRoute],
);

export default buildJourneyPlan(travelPlan);
