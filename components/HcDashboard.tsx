"use client";

import { useEffect, useRef } from "react";
import { useHighcharts } from "components/providers/HighchartsProvider";

import type Dashboards from "@highcharts/dashboards/es-modules/masters/dashboards.src.js";
import type { ReactNode } from "react";

type Params = {
  config: object;
  className?: string;
  disableUpdate?: boolean;
  onBoardRendered?: (board: Dashboards) => void;
  children?: ReactNode;
};

export default function HcDashboard({
  config,
  className,
  disableUpdate,
  onBoardRendered,
  children,
}: Params) {
  const { highchartsObjs } = useHighcharts();
  const dashboardDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!(highchartsObjs.dashboards && dashboardDiv.current)) {
      return;
    }

    if (disableUpdate) {
      return;
    }

    const dashboards = highchartsObjs.dashboards;
    const board = dashboards.board(dashboardDiv.current, config);
    if (onBoardRendered) {
      onBoardRendered(board);
    }

    return () => {
      try {
        // Clean up all the Highcharts event handlers, etc, on unmount or
        // this will just accumulate cruft and everything will go slow.
        if (board !== undefined) {
          board.destroy();
        }
      } catch (e) {
        // TODO: This happens a lot. Why?
        console.error("Error destroying dashboard", board, e);
      }
    };
  }, [highchartsObjs, disableUpdate, dashboardDiv, config, onBoardRendered]);

  return (
    <div ref={dashboardDiv} className={`hcdashboard ${className}`}>
      {children}
    </div>
  );
}
