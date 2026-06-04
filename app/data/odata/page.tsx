import OdataTable from "../_widgets/OdataTable";
import Section from "../_widgets/Section";
import SectionPage from "../_widgets/SectionPage";
import manifest from "../_manifest/odata.json";

export default function Page() {
  return (
    <SectionPage
      title="OSPI OData (Socrata mirror)"
      intro="A snapshot of every dataset published on OSPI's Socrata data portal, stored as paired AVRO + schema files. Useful when curated sections above don't expose the columns you need."
    >
      <Section
        heading={`${manifest.length.toLocaleString()} datasets`}
        blurb="Filter by Socrata code. Each row links the AVRO and the schema. The code is the Socrata identifier — look it up on OSPI's portal for the human-readable title."
      >
        <OdataTable entries={manifest} />
      </Section>
    </SectionPage>
  );
}
