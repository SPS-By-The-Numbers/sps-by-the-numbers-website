'use client';

import { useEffect, useRef } from 'react';
import { useHighcharts } from 'components/providers/HighchartsProvider';
import Box from '@mui/material/Box';

import type { ReactNode } from 'react';
import type { SxProps, Theme } from '@mui/material';

type Params = {
  config: object;
  handleDrawFinish?: (board: Dashboards) => void;
  children?: ReactNode;
  sx?: SxProps<Theme>;
};

export default function HcChart({config, handleDrawFinish, sx, children} : Params) {
  const { highchartsObjs } = useHighcharts();
  const chartDiv = useRef<HTMLDivElement>(null);

  useEffect(
    () => {
      if (!(highchartsObjs.dashboards && chartDiv.current)) {
        return;
      }

      const highcharts = highchartsObjs.highcharts;
      const board = highcharts.chart(chartDiv.current, config);
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
    [highchartsObjs, chartDiv, config, handleDrawFinish]
  );

  return (
    <Box
      component="div"
      sx={[
        {},
        ...(Array.isArray(sx) ? sx : [sx])
      ]}>
      <div ref={chartDiv} style={{overflow:"visible"}}>
        {children}
      </div>
    </Box>
  );
}

