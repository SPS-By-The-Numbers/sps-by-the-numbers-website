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
    let board = dashboards.board(dashboardDiv.current, config);
    if (onBoardRendered) {
      onBoardRendered(board);
    }

    // Highcharts uses the Fullscreen API but doesn't reflow nested
    // dashboard charts when the viewport changes during the
    // enter/exit-fullscreen transitions. Walk all chart instances on
    // each fullscreenchange event and reflow them so they pick up the
    // new container size.
    const reflowAllCharts = () => {
      for (const cell of board?.mountedComponents ?? []) {
        const chart = cell?.component?.chart;
        if (chart && typeof chart.reflow === "function") {
          // Defer to the next frame so layout has settled into the
          // fullscreen / non-fullscreen size before we measure.
          requestAnimationFrame(() => {
            try { chart.reflow(); } catch { /* ignore destroyed charts */ }
          });
        }
      }
    };
    document.addEventListener("fullscreenchange", reflowAllCharts);
    document.addEventListener("webkitfullscreenchange", reflowAllCharts);

    return () => {
      document.removeEventListener("fullscreenchange", reflowAllCharts);
      document.removeEventListener("webkitfullscreenchange", reflowAllCharts);
      try {
        // Clean up all the Highcharts event handlers, etc, on unmount or
        // this will just accumulate cruft and everything will go slow.
        board?.destroy();
        board = undefined;
      } catch (e) {
        console.warn("Error destroying dashboard:", board, e);
      }
    };
  }, [highchartsObjs, disableUpdate, dashboardDiv, config, onBoardRendered]);

  return (
    <div ref={dashboardDiv} className={`hcdashboard ${className}`}>
      {children}
    </div>
  );
}
