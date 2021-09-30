import { isPlainObject } from 'lodash';
import { compose, fork, json, rc, yaml } from '../../compositors';
import { listConcat, listSortConcat, mapConcat, primitive } from '../../routes';
import { buildJourneyPlan } from '../../utils/build-journey-plan';
import { buildTravelPlan } from '../../utils/build-travel-plan';

const mainRoute = compose({
	sortToTop: listSortConcat,

	$$default: fork(
		[Array.isArray, listConcat],
		[isPlainObject, mapConcat],
		primitive,
	),
});

const jsonRoute = json(mainRoute);
const yamlRoute = yaml(mainRoute);
const rcRoute = rc(mainRoute);

const travelPlan = buildTravelPlan(
	[/^\.fixpackrc\.json$/, jsonRoute],
	[/^\.fixpackrc\.ya?ml$/, yamlRoute],
	[/^\.fixpackrc$/, rcRoute],
);

export default buildJourneyPlan(travelPlan);
