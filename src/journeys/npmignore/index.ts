import { linesConcat } from '../../routes';
import { buildJourneyPlan } from '../../utils/build-journey-plan';
import { buildTravelPlan } from '../../utils/build-travel-plan';

const gitignorePlan = buildTravelPlan(
	[/^\.?npmignore$/, linesConcat],
);

export default buildJourneyPlan(gitignorePlan, '.npmignore');
