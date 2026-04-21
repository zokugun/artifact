import { isArray, isRecord } from '@zokugun/is-it-type';
import { compose, fork, json, mapSort, rc, yaml } from '../../compositors/index.js';
import { listConcat, listSortConcat, mapConcat, primitive } from '../../routes/index.js';
import { buildJourneyPlan } from '../../utils/build-journey-plan.js';
import { buildTravelPlan } from '../../utils/build-travel-plan.js';

const mainRoute = mapSort(compose({
	sortToTop: listSortConcat,

	$$default: fork(
		[isArray, listConcat],
		[isRecord, mapConcat],
		primitive,
	),
}));

const jsonRoute = json(mainRoute);
const yamlRoute = yaml(mainRoute);
const rcRoute = rc(mainRoute);

const travelPlan = buildTravelPlan(
	[/^\.fixpackrc\.json$/, jsonRoute],
	[/^\.fixpackrc\.ya?ml$/, yamlRoute],
	[/^\.fixpackrc$/, rcRoute],
);

export default buildJourneyPlan(travelPlan);
