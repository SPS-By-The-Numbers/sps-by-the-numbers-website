'use client'

import Highcharts from 'highcharts'
import highchartsAccessibility from "highcharts/modules/accessibility";
import HighchartsReact from 'highcharts-react-official'

import PAOExplorer from 'components/finance/PAOExplorer';

if (typeof window !== `undefined`) {
    highchartsAccessibility(Highcharts);
}

export default function Styled() {
  return (
      <PAOExplorer  />
  )
}
