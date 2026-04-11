import { linesConcat } from '../../routes/index.js';
import { buildJourneyPlan } from '../../utils/build-journey-plan.js';
import { buildTravelPlan } from '../../utils/build-travel-plan.js';

const gitignorePlan = buildTravelPlan(
	[/^\.?gitignore$/, linesConcat],
);

export default buildJourneyPlan(gitignorePlan, '.gitignore');
