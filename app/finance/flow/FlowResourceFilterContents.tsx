"use client";

// Resource (revenue) filter panels for the Expenditure Flow view.
//
// The flow engine can only apply the Resource filter when the Resource column
// is shown: with that column hidden there is no per-source split of the flow to
// test a source code against (revenue is still attributed to programs, but the
// diagram starts at the first expenditure column). Rather than let the filter
// sit there looking active while doing nothing, these wrappers render the
// Resource filter trees DISABLED whenever the Resource level is hidden, with a
// note pointing at the Levels control. The selection itself is untouched, so
// re-showing the Resource column brings the filter straight back.
//
// Every other level's filter DOES survive its column being hidden -- see
// ComputeFlowsOpts.gates in utilities/sankey/types.ts.

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
  RevenueCategoryFilterContents,
  RevenueFilterContents,
} from "app/finance/_widgets/ExpenditureFilterContents";

import type { ComponentProps, ReactNode } from "react";
import type { LevelPlan } from "./FlowSettings";

// The settings these wrappers see are FlowSettings; only the level plan is read
// here, so the props are otherwise passed straight through to the shared filter
// components.
function sourceShown(settings: unknown): boolean {
  const plan = (settings as { levelPlan?: LevelPlan }).levelPlan;
  return !!plan?.find((e) => e.level === "source")?.enabled;
}

// Grey out and make inert the filter tree it wraps.
function Inert({ children }: { children: ReactNode }) {
  return (
    <Box aria-disabled="true" sx={{ opacity: 0.5, pointerEvents: "none" }}>
      {children}
    </Box>
  );
}

export function FlowRevenueCategoryFilterContents(
  props: ComponentProps<typeof RevenueCategoryFilterContents>,
) {
  if (sourceShown(props.settings)) {
    return <RevenueCategoryFilterContents {...props} />;
  }
  return (
    <Box>
      <Typography
        variant="caption"
        component="p"
        sx={{ color: "text.secondary", mx: "0.5rem" }}
      >
        The Resource column is hidden, so the resource filters below do not
        apply. Show &ldquo;Resource (Source)&rdquo; under Levels to use them.
      </Typography>
      <Inert>
        <RevenueCategoryFilterContents {...props} />
      </Inert>
    </Box>
  );
}

export function FlowRevenueFilterContents(
  props: ComponentProps<typeof RevenueFilterContents>,
) {
  // The category panel above carries the explanation for both, so this one just
  // greys out.
  if (sourceShown(props.settings)) {
    return <RevenueFilterContents {...props} />;
  }
  return (
    <Inert>
      <RevenueFilterContents {...props} />
    </Inert>
  );
}
