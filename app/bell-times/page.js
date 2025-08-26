import BellTimes from './BellTimes';

import Schools from 'data/schools.json';
import SurveyData from 'data/bell-survey.json';

function makeItem(id, name, active, color) {
  return {itemId: id, name, active, color, type: 'item'};
}

function makeOption(id, name, options, value) {
  return {itemId: id, name, options, value, type: 'option'};
}


function makeData() {
  const schoolListState = Schools.map( s => ({
      schoolId: s,
      name: s, 
      active: true,
      color: 'grey'
    }));
  const DistanceOptions = [
    { value: "0", label: "Less than 1 mile" },
    { value: "1", label: "1-3 miles" },
    { value: "2", label: "3-5 miles" },
    { value: "3", label: "Greater than 5 miles" },
  ];

  const ServiceOptions = [
    { value: "99", label: "[No Response]" },
    { value: "0", label: "Consistently on time" },
    { value: "1", label: "Consistently late" },
    { value: "2", label: "Running but prefers other options" },
    { value: "3", label: "NOT Running. Forced to alternates." },
    { value: "4", label: "NOT Running but would not use" },
    { value: "5", label: "Not Assigned" },
  ];


  return {
    survreyData: SurveyData,
    initialSchools: schoolListState,
    initialFilters: [
      makeItem('bus-eligible', 'Eligible For Bus', true, 'grey'),
      makeItem('bus-ineligible', 'Not Eligible For Bus', true, 'grey'),
      makeItem('plans-on-bus', 'Planning to Bus in 2022-2023', true, 'grey'),
      makeItem('no-plans-on-bus', 'Not Planning to Bus in 2022-2023', true, 'grey'),
      makeItem('need-transit-help', 'W/o bus would need transit help', true, 'grey'),
      makeItem('no-need-transit-help', 'W/o bus would NOT need transit help', true, 'grey'),
      makeItem('prefers-2-bells', 'Prefers 2 bells', true, 'grey'),
      makeItem('prefers-3-bells', 'Prefers 3 bells', true, 'grey'),
      makeItem('split-bell-time', 'Split between tier 1 and 3', true, 'grey'),
      makeItem('no-split-bell-time', 'Not split between tier 1 and 3', true, 'grey'),
      makeItem('childcare-challenges', '3-bells = childcare challenges', true, 'grey'),
      makeItem('no-childcare-childcare', '3-bells will not create childcare challenges', true, 'grey'),
      makeOption('distance', 'Distance From School', DistanceOptions, DistanceOptions),
      makeOption('service', 'Bus Route Service', ServiceOptions, ServiceOptions),
    ],
  };
}

export default function BellTimesPage() {
  const {survreyData, initialSchools, initialFilters} = makeData();
  return (<BellTimes survreyData={survreyData}
    initialSchools={initialFilters}
    initialFilters={initialFilters}
    />);
}
