import Link from "@mui/material/Link";

import FileList from "../_widgets/FileList";
import Section from "../_widgets/Section";
import SectionPage from "../_widgets/SectionPage";
import manifest from "../_manifest/staffing.json";

export default function Page() {
  return (
    <SectionPage
      title="Staffing (S-275)"
      intro={
        <>
          The S-275 personnel report from OSPI lists every certificated and
          classified employee assignment in every district, per year. Raw files
          are Access databases (one per fiscal year); the processed AVROs split
          them into employee / assignment / report tables suitable for joining.
          See the{" "}
          <Link href="/finance/staffing">Staffing Dashboard</Link> for
          interactive views.
        </>
      }
    >
      <Section
        heading="Processed S-275 tables (AVRO)"
        count={manifest.processed_s275.length}
        blurb="Normalized cross-year tables. assignment.avro × employee.avro × report.avro is enough to reconstruct most staffing analyses."
      >
        <FileList files={manifest.processed_s275} />
      </Section>

      <Section
        heading="Raw S-275 personnel databases"
        count={manifest.raw_s275.length}
        blurb="Annual Access databases as published by OSPI SAFS."
      >
        <FileList files={manifest.raw_s275} />
      </Section>
    </SectionPage>
  );
}
