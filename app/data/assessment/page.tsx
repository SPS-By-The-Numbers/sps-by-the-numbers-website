import Link from "@mui/material/Link";

import FileList from "../_widgets/FileList";
import Section from "../_widgets/Section";
import SectionPage from "../_widgets/SectionPage";
import manifest from "../_manifest/assessment.json";

export default function Page() {
  return (
    <SectionPage
      title="Assessment"
      intro={
        <>
          OSPI Report Card assessment data plus per-school joined CSVs covering
          2015&ndash;2025. See the{" "}
          <Link href="/finance/assessments">Assessment Dashboard</Link> for an
          interactive view.
        </>
      }
    >
      <Section
        heading="Processed assessment AVRO"
        count={manifest.processed_avro.length}
        blurb="Report Card assessment data as a single AVRO."
      >
        <FileList files={manifest.processed_avro} />
      </Section>

      <Section
        heading="Joined per-school CSVs"
        count={manifest.analysis_csv.length}
        blurb="Multi-year joined CSVs at the school grain — convenient for spreadsheet work."
      >
        <FileList files={manifest.analysis_csv} />
      </Section>
    </SectionPage>
  );
}
