'use client';

import HighchartsReact from 'highcharts-react-official'
import { useHighcharts } from 'components/providers/HighchartsProvider';

export default function Histogram(props) {
  const { highchartsObjs } = useHighcharts();
  const getChartOptions = () => {
    return {
      title: { text: props.title },
      xAxis: {
        title: { text: props.data.xlabel },
        categories: props.data.categories
      },
      yAxis: {
        title: { text: props.data.ylabel },
        max: props.data.ymax
      },
      series: props.data.series.map(d => Object.assign({ type: "column" }, d)),
    };
  };

  return (
    <figure className="p-2 m-1 flex flex-col w-full bg-gray-100 histogram">
        <HighchartsReact
          highcharts={highchartsObjs.highcharts}
          options={getChartOptions()}
        />
    </figure>
  );
}
