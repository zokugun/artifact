import { linesConcat } from '../../routes';
import { buildJourneyPlan } from '../../utils/build-journey-plan';
import { buildTravelPlan } from '../../utils/build-travel-plan';

const ignorePlan = buildTravelPlan(
	[/^\..*ignore$/, linesConcat],
);

export default buildJourneyPlan(ignorePlan);
