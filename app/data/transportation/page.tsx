import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import DistrictReportChooser from "../_widgets/DistrictReportChooser";
import FileList from "../_widgets/FileList";
import Section from "../_widgets/Section";
import SectionPage from "../_widgets/SectionPage";
import manifest from "../_manifest/transportation.json";

const BUCKET_PREFIX = "https://storage.googleapis.com/sps-btn-data-all-data/";

const CATEGORY_DEFS = [
  {
    key: "kpi",
    label: "Key Performance Indicators",
    dirPrefix: "raw/stars/kpi/",
  },
  {
    key: "efficiency",
    label: "Efficiency Detail",
    dirPrefix: "raw/stars/efficiency/",
  },
  {
    key: "operations_allocation",
    label: "Operations Allocation",
    dirPrefix: "raw/stars/operations_allocation/",
  },
  {
    key: "quarterly_district",
    label: "Quarterly District Detail",
    dirPrefix: "raw/stars/quarterly_district/",
    seasonal: true,
  },
];

export default function Page() {
  const reviews = manifest.efficiency_reviews;
  return (
    <SectionPage
      title="Transportation (STARS)"
      intro={
        <>
          OSPI&apos;s Student Transportation Allocation and Reporting System
          (STARS) publishes per-district reports each school year. Use the
          chooser below to pull up reports for a specific district, or grab
          one of the rolled-up CSVs for cross-district analysis. The dashboards{" "}
          <Link href="/analyses/yellow_bus_ledger.html">WA State Transportation Dashboard</Link>{" "}
          and <Link href="/analyses/stars-exploiter.html">STARS Exploiter</Link>{" "}
          are both built on this data.
        </>
      }
    >
      <Section
        heading="District chooser"
        blurb={`${manifest.districts.length.toLocaleString()} districts × up to 9 school years × five report types. Pick a district to see what's on file.`}
      >
        <DistrictReportChooser
          districts={manifest.districts}
          categories={manifest.categories as Parameters<typeof DistrictReportChooser>[0]["categories"]}
          categoryDefs={CATEGORY_DEFS}
        />
      </Section>

      <Section
        heading="Processed STARS CSVs"
        count={manifest.processed.length}
        blurb="Flat CSVs joining every district and year — start here for analysis. Includes KPI, efficiency, quarterly district, operations allocation, and the supporting dimension tables (d_stars_*)."
      >
        <FileList files={manifest.processed} />
      </Section>

      <Section
        heading="Efficiency Reviews"
        count={reviews.length}
        blurb="Targeted reviews triggered by year-over-year efficiency-score moves across the 90% threshold. Smaller universe than the other categories — flat list below."
      >
        <Stack spacing={0.5}>
          {reviews.length === 0 && (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              No efficiency reviews on file.
            </Typography>
          )}
          {reviews.map((r) => (
            <Typography key={`${r.year}-${r.districtCode}-${r.classification}`} variant="body2">
              <Link
                href={`${BUCKET_PREFIX}raw/stars/efficiency_review/${r.file}`}
              >
                {r.year} &middot; {r.districtName} ({r.districtCode})
              </Link>{" "}
              <span style={{ color: "#666" }}>— {r.classification}</span>
            </Typography>
          ))}
        </Stack>
      </Section>

      <Section
        heading="Other"
        blurb="Bulk PRR response zip and the STARS source README."
      >
        <ul>
          {manifest.prr_transportation_zip && (
            <li>
              <Link href={`${BUCKET_PREFIX}${manifest.prr_transportation_zip}`}>
                Bulk PRR transportation zip
              </Link>
            </li>
          )}
          {manifest.readme && (
            <li>
              <Link href={`${BUCKET_PREFIX}${manifest.readme}`}>
                STARS source README
              </Link>
            </li>
          )}
        </ul>
      </Section>
    </SectionPage>
  );
}
