'use client';

import { useEffect, useRef } from 'react';
import { useHighcharts } from 'components/providers/HighchartsProvider';
import type Dashboards from '@highcharts/dashboards/es-modules/masters/dashboards.src.js';

type Params = {
  config: Dashboards.Board.Options;
  handleDrawFinish?: (board: Dashboards) => void;
  children: ReactNode;
};

export default function HcDashboard({config, handleDrawFinish, children} : Params) {
  const { highchartsObjs } = useHighcharts();
  const dashboardDiv = useRef<HTMLDivElement>(null);

  useEffect(
    () => {
      if (!highchartsObjs.dashboards || dashboardDiv.current === null) {
        return;
      }

      const dashboards = highchartsObjs.dashboards;
      const board = dashboards.board(dashboardDiv.current, config);
      if (handleDrawFinish) {
        handleDrawFinish(board);
      }

      return () => {
        // Clean up all the Highcharts event handlers, etc, on unmount or
        // this will just accumulate cruft and everything will go slow.
        if (board !== undefined) {
          board.destroy();
        }
      };
    },
    [highchartsObjs, dashboardDiv, config]
  );

  return (
    <div ref={dashboardDiv}>
      {children}
    </div>
  );
}
