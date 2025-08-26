import CascadiaDemographics from './CascadiaDemographics';
import hccRace from 'data/hcc-northend-resegregation.json';

export default function HccResegregationPage() {
  return (<CascadiaDemographics hccRace={hccRace} />);
}
