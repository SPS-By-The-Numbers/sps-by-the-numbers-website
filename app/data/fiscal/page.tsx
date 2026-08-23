import Link from "@mui/material/Link";

import FiscalOrgChooser from "../_widgets/FiscalOrgChooser";
import FiscalStatewideBrowser from "../_widgets/FiscalStatewideBrowser";
import FileList from "../_widgets/FileList";
import Section from "../_widgets/Section";
import SectionPage from "../_widgets/SectionPage";
import { fmtBytes, type FiscalCorpus } from "../_widgets/fiscalCorpus";
import manifest from "../_manifest/fiscal.json";

const DATA_TOOLS_MAIN =
  "https://github.com/SPS-By-The-Numbers/data-tools/blob/main";

// Display names + descriptions for the raw corpus subdirectories. Keys match
// the directory names under raw/fiscal/ in the bucket.
const SUBCORPUS_DEFS: Record<string, { label: string; desc: string }> = {
  apportionment: {
    label: "Apportionment",
    desc: "Monthly apportionment reports plus supporting schedules (1191FG grants, 1251/1251H FTE & headcount, 1735T special education, F-780 levy authority, final apportionment summaries) for every district, ESD, college, and state agency. The bulk of the corpus.",
  },
  fiscal: {
    label: "District F-195 / F-196 packets",
    desc: "Per-district budget and year-end packets: F-195 Budget, Budget Overview, and Four-year Summary Plan; F-196 All Pages and Summary.",
  },
  county_treasurer: {
    label: "County treasurer reports",
    desc: "County treasurer statements (PDF and XLS).",
  },
  esd_allocations: {
    label: "ESD allocations",
    desc: "Educational Service District allocation reports (core, professional development, nurse corps, ...).",
  },
  state_agencies_schools_colleges: {
    label: "State agencies, schools & colleges",
    desc: "Fiscal reports for state agencies and college-run school programs.",
  },
  state_institutions: {
    label: "State institutions",
    desc: "1191SI reports for institutional education programs (detention centers, jails, state facilities).",
  },
  technical_colleges: {
    label: "Technical colleges",
    desc: "Fiscal reports for technical college districts.",
  },
};

// The subcorpora filed statewide rather than per-org, in tab order.
const STATEWIDE_LABELS: Record<string, string> = {
  state_institutions: "State institutions",
  esd_allocations: "ESD allocations",
  county_treasurer: "County treasurer",
  state_agencies_schools_colleges: "State agencies & colleges",
  technical_colleges: "Technical colleges",
};

// Subcorpora OSPI published as unnamed "PDF (n)" / "XLS (n)" downloads.
const UNNAMED_SUBCORPORA = [
  "county_treasurer",
  "state_agencies_schools_colleges",
  "technical_colleges",
];

export default function Page() {
  // JSON imports widen the [setId, dirId] pairs to number[], so the tuple
  // shape has to be reasserted rather than narrowed.
  const corpus = manifest.corpus as unknown as FiscalCorpus | null;

  const orgFiles = corpus
    ? corpus.subcorpora
        .filter((s) => s.dir === "fiscal" || s.dir === "apportionment")
        .reduce((n, s) => n + s.files, 0)
    : 0;
  const statewideFiles = corpus
    ? corpus.subcorpora
        .filter((s) => STATEWIDE_LABELS[s.dir])
        .reduce((n, s) => n + s.files, 0)
    : 0;

  return (
    <SectionPage
      title="Fiscal Reports (OSPI PDFs)"
      intro={
        <>
          OSPI publishes district fiscal reporting as PDFs: F-195 budget and
          F-196 year-end packets for every district, plus the monthly
          apportionment reports and their supporting schedules. This corpus is
          the source behind the <code>fiscal_*</code> tables (including the
          revised-budget series on the{" "}
          <Link href="/finance/vitals">Finance Dashboard</Link>) — it captures
          dimensions that exist nowhere in the machine-readable SAFS databases,
          like the mid-year revised budget.
        </>
      }
    >
      <Section
        heading="Extracted AVRO tables"
        count={manifest.tables.length}
        blurb={
          <>
            One AVRO per parsed table, concatenated across all years and
            districts — start here for analysis. Column-by-column documentation
            lives in the data-tools repository:{" "}
            <Link href={`${DATA_TOOLS_MAIN}/extractors/fiscal/CSV_GUIDE.md`}>
              fiscal CSV guide
            </Link>{" "}
            (per-table schemas, keys, invariants, worked SQL),{" "}
            <Link href={`${DATA_TOOLS_MAIN}/docs/DATA_DICTIONARY.md`}>
              generated data dictionary
            </Link>
            ,{" "}
            <Link href={`${DATA_TOOLS_MAIN}/extractors/fiscal/OVERVIEW.md`}>
              corpus overview
            </Link>
            ,{" "}
            <Link href={`${DATA_TOOLS_MAIN}/extractors/fiscal/COVERAGE.md`}>
              parse coverage
            </Link>
            , and{" "}
            <Link
              href={`${DATA_TOOLS_MAIN}/extractors/fiscal/DATA_SOURCE_DIVERGENCE.md`}
            >
              how this differs from the SAFS databases
            </Link>
            .
          </>
        }
      >
        <FileList files={manifest.tables} />
      </Section>

      {corpus && (
        <Section
          heading="Browse by district, college or agency"
          count={orgFiles}
          blurb={
            <>
              {corpus.orgs.length.toLocaleString()} organizations × up to{" "}
              {corpus.fiscal_years.length} school years. Pick one to get its
              budget (F-195) and year-end (F-196) packets alongside its
              apportionment reports — monthly apportionment, 1251/1251H
              enrollment, 1735T special education, F-780 levy authority, and the
              rest. Districts also appear under their ESD, which files a
              parallel set of apportionment reports for its members.
            </>
          }
        >
          <FiscalOrgChooser corpus={corpus} />
        </Section>
      )}

      {corpus && (
        <Section
          heading="Statewide & other reports"
          count={statewideFiles}
          blurb="The subcorpora OSPI files by year rather than by district: state institution 1191SI reports, ESD allocations, county treasurer statements, and the state agency, college and technical college reports."
        >
          <FiscalStatewideBrowser
            corpus={corpus}
            labels={STATEWIDE_LABELS}
            unnamed={UNNAMED_SUBCORPORA}
          />
        </Section>
      )}

      <Section
        heading="Raw PDF corpus"
        blurb={
          corpus ? (
            <>
              {corpus.total_files.toLocaleString()} PDFs,{" "}
              {fmtBytes(corpus.total_bytes)} in total (listing refreshed{" "}
              {corpus.generated}).
            </>
          ) : (
            <>Summary unavailable — regenerate fiscal_corpus_index.json.</>
          )
        }
      >
        {corpus && (
          <table style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
                <th style={{ padding: "4px 12px 4px 0" }}>Subcorpus</th>
                <th style={{ padding: "4px 12px 4px 0", textAlign: "right" }}>
                  Files
                </th>
                <th style={{ padding: "4px 12px 4px 0", textAlign: "right" }}>
                  Size
                </th>
                <th style={{ padding: "4px 0" }}>What it is</th>
              </tr>
            </thead>
            <tbody>
              {corpus.subcorpora.map((s) => {
                const def = SUBCORPUS_DEFS[s.dir];
                return (
                  <tr
                    key={s.dir}
                    style={{
                      borderBottom: "1px solid #eee",
                      verticalAlign: "top",
                    }}
                  >
                    <td
                      style={{
                        padding: "4px 12px 4px 0",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <code>{s.dir}/</code>
                    </td>
                    <td
                      style={{
                        padding: "4px 12px 4px 0",
                        textAlign: "right",
                      }}
                    >
                      {s.files.toLocaleString()}
                    </td>
                    <td
                      style={{
                        padding: "4px 12px 4px 0",
                        textAlign: "right",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {fmtBytes(s.bytes)}
                    </td>
                    <td style={{ padding: "4px 0", color: "#555" }}>
                      {def ? (
                        <>
                          <strong>{def.label}.</strong> {def.desc}
                        </>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Section>
    </SectionPage>
  );
}
