import FileList from "../_widgets/FileList";
import Section from "../_widgets/Section";
import SectionPage from "../_widgets/SectionPage";
import manifest from "../_manifest/public-records.json";

export default function Page() {
  return (
    <SectionPage
      title="Public Records Requests"
      intro="Documents released through Public Records Requests. Most installments are PDFs accompanied by a redaction log."
    >
      <Section
        heading="SOFG and related installments"
        count={manifest.length}
        blurb="Includes the original installments, redaction logs, and the README explaining context."
      >
        <FileList files={manifest} />
      </Section>
    </SectionPage>
  );
}
