import { mergeDotJs } from '../../routes/index.js';
import { buildJourneyPlan } from '../../utils/build-journey-plan.js';
import { buildTravelPlan } from '../../utils/build-travel-plan.js';

const travelPlan = buildTravelPlan(
	[/\.config\.ts/, mergeDotJs],
);

export default buildJourneyPlan(travelPlan);
