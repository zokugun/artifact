import { compose, json, rc, yaml } from '../../compositors/index.js';
import { listConcat, overwrite, primitive } from '../../routes/index.js';
import { buildJourneyPlan } from '../../utils/build-journey-plan.js';
import { buildTravelPlan } from '../../utils/build-travel-plan.js';

const mainRoute = compose({
	extends: listConcat,
	parserPreset: primitive,
	rules: compose({
		$$default: overwrite,
	}),
	$$default: primitive,
});

const jsonRoute = json(mainRoute);
const yamlRoute = yaml(mainRoute);
const rcRoute = rc(mainRoute);

const travelPlan = buildTravelPlan(
	['.commitlintrc.json', jsonRoute],
	['.commitlintrc.yaml', yamlRoute],
	['.commitlintrc.yml', yamlRoute],
	['.commitlintrc', rcRoute],
);

export default buildJourneyPlan(travelPlan);
