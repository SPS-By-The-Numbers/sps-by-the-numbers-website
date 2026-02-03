## Getting Started

Run the development server:

```bash
npm run dev:watch
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Basic design
This is a Next.js system deployed into firebase using MUI for UI, Highcharts.js for charting
and arquero for dataframes and manipulations.

The major UX design goals are
  1. Produce graphs of district stats that are somewhat robust to misinterptation (full history, correct labels, context presented, etc)
  2. Allow self-guided exploration of the data.
  3. Provide stable URLs that can recreate the charts so they can be sent to others and posted.
  4. Ensure data sources and fiters are documented and understandable.

The major system design goals are
  1. Mostly client-side logic.
  2. Low hosting cost.

This, unfortunatley, ends up creating a rather complex codebase.  Typescript and testing were
added late in the phase when complexity started growing out of control. Alas.
