"use client";

// The salary skyline: one column per employee, height their total_final_salary,
// grouped by duty title and wrapped across rows.
//
// Each row is its own Highcharts chart sharing one y-axis maximum and one
// x-axis slot count, so heights and horizontal positions are comparable
// between rows.
//
// The columns are drawn as a stepped area per duty rather than a column
// series. At ~1,500 people across ~1,400px a column is under a pixel wide, so
// the two are pixel-identical, but a column series emits one SVG path per
// person -- 7,156 of them for SPS 2024-25, enough to lock the main thread for
// tens of seconds. Stepping an area over the same points draws one path per
// duty instead, while keeping a point per person so tooltips still resolve to
// an individual.

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useEffect, useRef } from "react";

import { useHighcharts } from "components/providers/HighchartsProvider";

import type { Plan, Row } from "./rowPlan";

// Duty titles are colored only to separate neighbours; the palette is the
// CVD-safe one used by the Sankey pages.
const PALETTE = [
  "#0072B2",
  "#D55E00",
  "#009E73",
  "#CC79A7",
  "#56B4E9",
  "#E69F00",
  "#7A5195",
  "#4C6472",
];

const ROW_HEIGHT = 190;
// Duties at or below this many people are drawn as columns. Worst case is one
// SVG path per person across the small duties only, which stays in the low
// hundreds even for a district with a long tail of one-person titles.
const COLUMN_MAX_PEOPLE = 60;
// Plot-area insets; the HTML label strip has to line up with these.
const PLOT_LEFT = 62;
const PLOT_RIGHT = 12;

const money = (v: number) =>
  v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M` : `$${Math.round(v / 1000)}k`;

type Props = {
  plan: Plan;
  /** Stable duty -> palette index, so a duty keeps its color across rows. */
  colorOf: Map<string, number>;
  year: string;
};

function rowOptions(
  row: Row,
  plan: Plan,
  colorOf: Map<string, number>,
  isFirst: boolean,
) {
  // Color is set two ways on purpose. The app loads Highcharts' styled-mode
  // CSS, whose `.highcharts-color-N { fill: var(--highcharts-color-N) }` rule
  // lands on the series <g>; an area series then puts its own fill on the
  // <path> inside, which wins, while a column series inherits from the <g>,
  // where the CSS wins. Setting `color` and the colorIndex, with
  // SalarySkyline rebinding --highcharts-color-N to the same palette, gives
  // the same result whichever one takes effect.
  const series = row.segments.map((seg) => ({
    // Small duties are drawn as columns, big ones as a stepped area.
    //
    // A step-area only has horizontal extent between consecutive points, so a
    // one-person duty -- Superintendent, and most of the long tail -- covers
    // zero width and renders as nothing at all. Columns size each point
    // exactly and do not have that problem; they were only ever a problem in
    // bulk, where one SVG path per person locks up the renderer. Below the
    // threshold the element count is negligible, above it the two are
    // pixel-identical at under a pixel per person.
    type:
      seg.people.length <= COLUMN_MAX_PEOPLE
        ? ("column" as const)
        : ("area" as const),
    step: "left" as const,
    name: seg.label,
    color: PALETTE[(colorOf.get(seg.duty) ?? 0) % PALETTE.length],
    colorIndex: (colorOf.get(seg.duty) ?? 0) % PALETTE.length,
    // Explicit x keeps each segment in its own slot range, so a partly filled
    // final row stops where it stops instead of stretching to full width.
    data: seg.people.map((p, i) => ({
      x: seg.start + i,
      y: p.salary,
      fte: p.fte,
      duty: seg.duty,
    })),
  }));

  return {
    chart: {
      type: "area",
      height: ROW_HEIGHT,
      marginTop: 6,
      marginLeft: PLOT_LEFT,
      marginRight: PLOT_RIGHT,
      animation: false,
      spacingBottom: 6,
    },
    title: { text: undefined },
    credits: { enabled: false },
    legend: { enabled: false },
    accessibility: {
      description:
        `Salaries for people ${row.offset + 1} to ${row.offset + row.filled} ` +
        `of ${plan.totalPeople}, by duty title, tallest first.`,
    },
    xAxis: {
      min: -0.5,
      max: plan.slotsPerRow - 0.5,
      tickLength: 0,
      lineColor: "#bbb",
      labels: { enabled: false },
    },
    yAxis: {
      // Shared across rows: heights only mean something if the scale is fixed.
      min: 0,
      max: plan.maxSalary,
      title: { text: undefined },
      gridLineColor: "#eee",
      labels: {
        formatter(this: { value: number }) {
          return money(this.value);
        },
        style: { color: "#888", fontSize: "10.5px" },
      },
    },
    plotOptions: {
      column: {
        // Match the area's flush silhouette: no gaps, no rounded corners, and
        // no sub-slot splitting between the series sharing this row.
        grouping: false,
        pointPadding: 0,
        groupPadding: 0,
        borderWidth: 0,
        borderRadius: 0,
        crisp: false,
        animation: false,
      },
      area: {
        // Fill to the axis, no outline and no markers: the silhouette is the
        // chart, and a marker per person would put the 7k elements back. The
        // hover marker is the exception -- it is drawn one at a time, and it
        // is what shows which individual the tooltip is quoting.
        threshold: 0,
        fillOpacity: 1,
        lineWidth: 0,
        marker: {
          enabled: false,
          states: { hover: { enabled: true, radius: 3 } },
        },
        animation: false,
        crisp: false,
      },
      series: {
        // Nearest-point tracking. Columns here are sub-pixel, so requiring an
        // exact hit would make the tooltip unreachable.
        stickyTracking: true,
        // Rows carry ~1,500 points, well past the default 1,000 turbo
        // threshold, beyond which Highcharts only accepts bare numbers and
        // silently drops the per-point FTE / duty the tooltip reads.
        turboThreshold: 0,
      },
    },
    tooltip: {
      // The height is the paycheck; FTE and the implied rate are what the
      // height alone cannot tell you, so both ride along.
      useHTML: true,
      formatter(this: { y: number; point: { fte: number; duty: string } }) {
        const fte = this.point.fte;
        const rate = fte > 0 ? this.y / fte : null;
        return (
          `<b>$${Math.round(this.y).toLocaleString()}</b><br>` +
          `${this.point.duty}<br>` +
          `${fte.toFixed(2)} FTE` +
          (rate === null ? "" : ` · $${Math.round(rate).toLocaleString()}/FTE`)
        );
      },
    },
    series,
    exporting: { enabled: isFirst },
  };
}

export default function SalarySkyline({ plan, colorOf, year }: Props) {
  const { highchartsObjs } = useHighcharts();
  const hostRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const highcharts = highchartsObjs?.highcharts;
    if (!highcharts) return;

    // A district-year is one column per employee -- 7,156 SVG paths for SPS
    // 2024-25. Building every row up front locks the main thread for tens of
    // seconds, so each row is drawn only once it is near the viewport, and
    // the rows below stay empty boxes of the right height until then.
    const charts = new Map<number, { destroy: () => void }>();
    const draw = (i: number) => {
      const host = hostRefs.current[i];
      if (!host || charts.has(i)) return;
      charts.set(
        i,
        highcharts.chart(
          host,
          rowOptions(plan.rows[i], plan, colorOf, i === 0),
        ),
      );
    };

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver === "undefined") {
      plan.rows.forEach((_row, i) => draw(i));
    } else {
      observer = new IntersectionObserver(
        (entries, obs) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const i = Number((entry.target as HTMLElement).dataset.row);
            draw(i);
            obs.unobserve(entry.target);
          }
        },
        // A screen of lead time, so a row is usually ready by the time it
        // scrolls in.
        { rootMargin: "600px 0px" },
      );
      for (const host of hostRefs.current) if (host) observer.observe(host);
    }

    return () => {
      observer?.disconnect();
      for (const chart of charts.values()) chart.destroy();
    };
  }, [highchartsObjs, plan, colorOf]);

  if (plan.rows.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: "text.secondary" }}>
        No S-275 salaries on file for {year}.
      </Typography>
    );
  }

  const paletteVars = Object.fromEntries(
    PALETTE.map((c, i) => [`--highcharts-color-${i}`, c]),
  ) as React.CSSProperties;

  return (
    <Box sx={paletteVars}>
      {plan.rows.map((row, i) => (
        <Box key={i} sx={{ mb: 1 }}>
          {/*
            Duty labels are HTML rather than Highcharts plot-band labels. The
            app's styled-mode CSS overrides plot-band fills (a transparent band
            computes to black), and positioning them here also lets narrow
            duties drop their label instead of overlapping a neighbour's.
            Percentages are taken across the plot area, so they stay aligned
            with the columns when the chart resizes.
          */}
          <Box
            sx={{
              position: "relative",
              height: 20,
              ml: `${PLOT_LEFT}px`,
              mr: `${PLOT_RIGHT}px`,
            }}
          >
            {row.segments.map((seg) => {
              const left = (seg.start / plan.slotsPerRow) * 100;
              const width = (seg.people.length / plan.slotsPerRow) * 100;
              return (
                <Box
                  key={seg.label}
                  sx={{
                    position: "absolute",
                    left: `${left}%`,
                    width: `${width}%`,
                    borderLeft: seg.start > 0 ? "1px solid" : undefined,
                    borderColor: "divider",
                    pl: 0.5,
                    fontSize: "11.5px",
                    fontWeight: 600,
                    color: "text.secondary",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                  }}
                >
                  {/* Too narrow to hold a label without spilling over. */}
                  {width > 6
                    ? seg.continued
                      ? seg.label
                      : `${seg.label} — ${seg.people.length.toLocaleString()} people`
                    : ""}
                </Box>
              );
            })}
          </Box>
          <div
            data-row={i}
            style={{ height: ROW_HEIGHT }}
            ref={(el) => void (hostRefs.current[i] = el)}
          />
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", pl: "62px", display: "block" }}
          >
            {(row.offset + 1).toLocaleString()}–
            {(row.offset + row.filled).toLocaleString()} of{" "}
            {plan.totalPeople.toLocaleString()}, sorted by salary within each
            duty
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
