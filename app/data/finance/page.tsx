import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";

import Section from "../_widgets/Section";
import SectionPage from "../_widgets/SectionPage";
import manifest from "../_manifest/finance.json";

const BUCKET_PREFIX = "https://storage.googleapis.com/sps-btn-data-all-data/";

// SPS budget filenames follow "<yyyy>-<yyyy>-<doc-slug>.<ext>" (plus a
// yearless README). Parse them so the section can group by school year with
// readable document labels instead of a flat basename list.
type BudgetEntry = { file: string; path: string };
const BUDGET_NAME_RE = /^(\d{4}-\d{4})-(.+)\.([a-z0-9]+)$/;

function budgetLabel(slug: string, ext: string) {
  // Dated revision suffix, e.g. "purple-book-2-26" = the 2/26 revision.
  const dated = slug.match(/^(.*)-(\d{1,2})-(\d{2})$/);
  if (dated)
    return `${budgetLabel(dated[1], ext)} (${dated[2]}/${dated[3]} revision)`;
  const words = slug
    .split("-")
    .map((w) => {
      if (w === "wss") return "WSS";
      if (w === "f195") return "F-195";
      if (w === "budgetdata") return "budget data";
      return w;
    })
    .join(" ");
  const label = words.charAt(0).toUpperCase() + words.slice(1);
  return ext === "pdf" ? label : `${label} (${ext})`;
}

function BudgetsByYear({ rows }: { rows: BudgetEntry[] }) {
  const byYear = new Map<string, { entry: BudgetEntry; label: string }[]>();
  const yearless: { entry: BudgetEntry; label: string }[] = [];
  for (const entry of rows) {
    const m = entry.file.match(BUDGET_NAME_RE);
    if (m) {
      const [, year, slug, ext] = m;
      if (!byYear.has(year)) byYear.set(year, []);
      byYear.get(year)!.push({ entry, label: budgetLabel(slug, ext) });
    } else {
      yearless.push({ entry, label: entry.file });
    }
  }
  const years = Array.from(byYear.entries()).sort((a, b) =>
    b[0].localeCompare(a[0]),
  );
  return (
    <Stack spacing={0.5}>
      {years.map(([year, docs]) => (
        <div
          key={year}
          style={{
            borderTop: "1px solid #eee",
            paddingTop: 4,
            paddingBottom: 2,
          }}
        >
          <span style={{ fontWeight: 500, marginRight: 12 }}>{year}</span>
          {docs.map((d, i) => (
            <span key={d.entry.path}>
              {i > 0 && <span style={{ color: "#bbb" }}> · </span>}
              <Link href={`${BUCKET_PREFIX}${d.entry.path}`}>{d.label}</Link>
            </span>
          ))}
        </div>
      ))}
      {yearless.length > 0 && (
        <div style={{ borderTop: "1px solid #eee", paddingTop: 4 }}>
          <span style={{ fontWeight: 500, marginRight: 12 }}>Other</span>
          {yearless.map((d, i) => (
            <span key={d.entry.path}>
              {i > 0 && <span style={{ color: "#bbb" }}> · </span>}
              <Link href={`${BUCKET_PREFIX}${d.entry.path}`}>{d.label}</Link>
            </span>
          ))}
        </div>
      )}
    </Stack>
  );
}

export default function Page() {
  return (
    <SectionPage
      title="SPS Budget and Purple Books"
      intro={
        <>
          Seattle Public Schools&apos; own budget documents — adopted budgets,
          budget books, and the supporting &ldquo;purple books&rdquo; — going
          back to 2002. Statewide machine-readable financial data lives in the{" "}
          <Link href="/data/safs">SAFS Financial Databases</Link> section, and
          the scanned state fiscal-report PDFs in{" "}
          <Link href="/data/fiscal">Fiscal Reports (OSPI PDFs)</Link>.
        </>
      }
    >
      <Section
        heading="Budget documents by school year"
        count={manifest.sps_budgets.length}
        blurb={
          <>
            Every file in <code>raw/sps/budget/</code>, grouped by school year:
            adopted/operating/capital budgets, budget books, the supporting
            &ldquo;purple books&rdquo;, WSS models, and one-off supporting
            documents. Older years were scraped from archive.org; see notes at
            the bottom of this section for the URLs used.
          </>
        }
      >
        <BudgetsByYear rows={manifest.sps_budgets} />
        <details style={{ marginTop: 8 }}>
          <summary style={{ cursor: "pointer", color: "#555" }}>
            How these were sourced
          </summary>
          <ul>
            <li>
              2019&ndash;present:{" "}
              <code>seattleschools.org/departments/finance/budget/</code>
            </li>
            <li>
              2016&ndash;2018:{" "}
              <code>
                seattleschools.org/cms/One.aspx?portalId=627&amp;pageId=4236325
              </code>
            </li>
            <li>
              2015:{" "}
              <code>
                sps.ss8.sharpschool.com/cms/one.aspx?portalId=627&amp;pageId=14984
              </code>
            </li>
            <li>
              2014&ndash;2015 has a broken-link patch; checking different months
              will find it
            </li>
            <li>
              2007&ndash;2014:{" "}
              <code>
                seattleschools.org/modules/cms/pages.phtml?sessionid=&amp;pageid=225568
              </code>
            </li>
            <li>
              2004&ndash;2005: blue book era &mdash; one PDF per school via
              archive.org
            </li>
            <li>
              2002&ndash;2003:{" "}
              <code>seattleschools.org/area/finance/budget/index.html</code>
            </li>
          </ul>
        </details>
      </Section>
    </SectionPage>
  );
}
