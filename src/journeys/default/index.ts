import isPlainObject from 'lodash/isPlainObject';
import { compose, fork, json, yaml } from '../../compositors';
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

const travelPlan = buildTravelPlan(
	[/\.json$/, jsonRoute],
	[/\.ya?ml$/, yamlRoute],
);

export default buildJourneyPlan(travelPlan);
