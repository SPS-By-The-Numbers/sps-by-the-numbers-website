import Link from "@mui/material/Link";

import FileList from "../_widgets/FileList";
import Section from "../_widgets/Section";
import SectionPage from "../_widgets/SectionPage";
import manifest from "../_manifest/enrollment.json";

export default function Page() {
  return (
    <SectionPage
      title="Enrollment (P-223)"
      intro={
        <>
          P-223 is the monthly headcount every district reports to OSPI. Below
          you&apos;ll find the source PDFs, the machine-readable monthly CSVs,
          and the longitudinal workbooks SAFS publishes. The{" "}
          <Link href="/finance/enrollment">Enrollment Dashboard</Link> is built
          on these.
        </>
      }
    >
      <Section
        heading="Processed monthly CSVs (OSPI statewide)"
        count={manifest.processed_monthly_csv.length}
        blurb="One CSV per month, cleaned from the OSPI source PDFs into a tidy table. Months are named YYYY-MM."
      >
        <FileList
          files={manifest.processed_monthly_csv.map((m) => ({
            file: m.month,
            path: m.path,
          }))}
        />
      </Section>

      <Section
        heading="SPS P-223 PDFs"
        count={manifest.sps_p223_pdf.length}
        blurb="Monthly P-223 PDFs filed by Seattle Public Schools."
      >
        <FileList files={manifest.sps_p223_pdf} />
      </Section>

      <Section
        heading="OSPI statewide P-223 PDFs"
        count={manifest.ospi_p223_pdf.length}
        blurb="Monthly P-223 PDFs covering every district in Washington (each is a single statewide report)."
      >
        <FileList
          files={manifest.ospi_p223_pdf.map((e) => ({
            file: e.month ? `${e.month}.pdf` : e.file,
            path: e.path,
          }))}
        />
      </Section>

      <Section
        heading="SAFS historical enrollment workbooks"
        count={manifest.safs_p223_source.length}
        blurb="Multi-decade enrollment summaries published by SAFS as Excel workbooks."
      >
        <FileList files={manifest.safs_p223_source} />
      </Section>

      <Section
        heading="Processed enrollment AVRO"
        count={manifest.processed_avro.length}
        blurb="A single AVRO suitable for loading into dataframes; this is what the enrollment dashboard fetches."
      >
        <FileList files={manifest.processed_avro} />
      </Section>
    </SectionPage>
  );
}
