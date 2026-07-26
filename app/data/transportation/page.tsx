import Link from "@mui/material/Link";

import DistrictReportChooser from "../_widgets/DistrictReportChooser";
import FileList from "../_widgets/FileList";
import Section from "../_widgets/Section";
import SectionPage from "../_widgets/SectionPage";
import manifest from "../_manifest/transportation.json";

const BUCKET_PREFIX = "https://storage.googleapis.com/sps-btn-data-all-data/";
const DATA_TOOLS_MAIN =
  "https://github.com/SPS-By-The-Numbers/data-tools/blob/main";

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
    // Targeted reviews triggered by year-over-year efficiency-score moves
    // across the 90% threshold, so most district-years have none.
    key: "efficiency_review",
    label: "Efficiency Review",
    dirPrefix: "raw/stars/efficiency_review/",
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
  return (
    <SectionPage
      title="Transportation (STARS)"
      intro={
        <>
          OSPI&apos;s Student Transportation Allocation and Reporting System
          (STARS) publishes per-district reports each school year. Use the
          chooser below to pull up reports for a specific district, or grab one
          of the rolled-up CSVs for cross-district analysis. The dashboards{" "}
          <Link href="/analyses/yellow_bus_ledger.html">
            WA State Transportation Dashboard
          </Link>{" "}
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
          categories={
            manifest.categories as Parameters<
              typeof DistrictReportChooser
            >[0]["categories"]
          }
          categoryDefs={CATEGORY_DEFS}
        />
      </Section>

      <Section
        heading="Processed STARS tables (AVRO + CSV)"
        count={manifest.processed.length}
        blurb={
          <>
            Flat tables joining every district and year — start here for
            analysis. Includes KPI, efficiency, quarterly district, operations
            allocation, and the supporting dimension tables (
            <code>d_stars_*</code>), each published as both AVRO and CSV.
            Column-by-column documentation lives in the data-tools repository:{" "}
            <Link href={`${DATA_TOOLS_MAIN}/extractors/stars/CSV_GUIDE.md`}>
              STARS CSV guide
            </Link>
            ,{" "}
            <Link href={`${DATA_TOOLS_MAIN}/extractors/stars/COVERAGE.md`}>
              parse coverage
            </Link>
            , and the{" "}
            <Link href={`${DATA_TOOLS_MAIN}/docs/DATA_DICTIONARY.md`}>
              generated data dictionary
            </Link>
            .
          </>
        }
      >
        <FileList files={manifest.processed} />
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
