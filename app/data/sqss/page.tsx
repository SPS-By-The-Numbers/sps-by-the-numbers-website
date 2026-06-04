import FileList from "../_widgets/FileList";
import Section from "../_widgets/Section";
import SectionPage from "../_widgets/SectionPage";
import manifest from "../_manifest/sqss.json";

export default function Page() {
  return (
    <SectionPage
      title="School Quality Status System (SQSS)"
      intro="Washington's School Quality Status System data — accountability indicators per school, per year, as AVRO."
    >
      <Section
        heading="Raw SQSS dumps"
        count={manifest.raw.length}
        blurb="Each file is a multi-year dump; the year range is in the filename."
      >
        <FileList files={manifest.raw} />
      </Section>

      <Section
        heading="Processed Report Card SQSS"
        count={manifest.processed.length}
        blurb="Cleaned AVRO ready for analysis."
      >
        <FileList files={manifest.processed} />
      </Section>
    </SectionPage>
  );
}
