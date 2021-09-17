import { linesConcat } from '../../routes';
import { buildJourneyPlan } from '../../utils/build-journey-plan';
import { buildTravelPlan } from '../../utils/build-travel-plan';

const gitignorePlan = buildTravelPlan(
	[/^\.?gitignore$/, linesConcat],
);

export default buildJourneyPlan(gitignorePlan, '.gitignore');
