import type { ColumnTable } from 'arquero';

import * as aq from 'arquero';
import { op } from 'arquero';

export const DEFAULT_PRECISION = 2;

export function makeCurrencyFormatter(precision : number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: precision,
  }).format;
}

export function dfToJSONConnectorOptions(df : ColumnTable, precision = DEFAULT_PRECISION) {
  const newDf = df.derive({
    covid_shape: d => {
      if (d.class_of < 2020) {
        return 'triangle-down';
      } else if (d.class_of < 2022) {
        return 'square';
      } else {
        return 'triangle';
      }
    }})
    .derive({
      marker_radius: d => {
        if (d.class_of < 2020) {
          return 4;
        } else if (d.class_of < 2022) {
          return 2;
        } else {
          return 6;
        }
      }
    });

   const undefinedToNull = newDf.columnNames().reduce((acc, col) => {
     acc[col] = aq.escape(d => d[col] === undefined ? null : d[col]);
     return acc;
   }, {});

   const roundNumbers = newDf.columnNames().reduce((acc, col) => {
     acc[col] = aq.escape(
       d => typeof d[col] === "number" ? op.round(d[col] * (10**precision))/(10**precision): d[col]);
       return acc;
   }, {});

   const data = newDf.derive(undefinedToNull).derive(roundNumbers).objects();
   return {
     firstRowAsNames: false,
     data,
   };
}

