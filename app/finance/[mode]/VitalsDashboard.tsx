export default function ComparisonDashboard({idPrefix, data, xColumn, xLabel,
                                            facetOrder, metricList} : Params) {
  const { highchartsObjs } = useHighcharts();
  const dashboardDiv = useRef<HTMLDivElement>(null);

  useEffect(
    () => {
      if (!highchartsObjs.dashboards || dashboardDiv.current === null) {
        return;
      }

      const dashboards = highchartsObjs.dashboards;
      const board = renderHighchartDashboard(dashboardDiv, dashboards, xColumn, xLabel,
                                             idPrefix, data, facetOrder, metricList);

      return () => {
        // Clean up all the Highcharts event handlers, etc, on unmount or
        // this will just accumulate cruft and everything will go slow.
        if (board !== undefined) {
          board.destroy();
        }
      };
    },
    [dashboardDiv, highchartsObjs, data, facetOrder, metricList, xLabel, idPrefix, xColumn]
  );
  return (
    <Paper>
      <div ref={dashboardDiv}>
        <Loading text="Loading..." />
      </div>
    </Paper>
  );
}
