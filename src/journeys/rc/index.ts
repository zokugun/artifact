import { isPlainObject } from 'lodash';
import { compose, fork, json, rc, yaml } from '../../compositors';
import { hash, listConcat, primitive } from '../../routes';
import { buildJourneyPlan } from '../../utils/build-journey-plan';
import { buildTravelPlan } from '../../utils/build-travel-plan';

const mainRoute = compose({
	$$default: fork(
		[Array.isArray, listConcat],
		[isPlainObject, hash],
		primitive,
	),
});

const jsonRoute = json(mainRoute);
const yamlRoute = yaml(mainRoute);
const rcRoute = rc(mainRoute);

const travelPlan = buildTravelPlan(
	[/^\.\w+rc\.json$/, jsonRoute],
	[/^\.\w+rc\.ya?ml$/, yamlRoute],
	[/^\.\w+rc$/, rcRoute],
);

export default buildJourneyPlan(travelPlan);
