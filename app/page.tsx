import ActionAreaCard from "components/ActionAreaCard";
import BottomNav from './BottomNav';
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

function panoramaSlicerCard() {
  return (
    <ActionAreaCard
      imageUrl="/assets/finance-app.png"
      href="/panorama"
      altText="Link to Panorama data slicer tool">
      <>
        <Typography gutterBottom variant="h4" component="div">
          Panorama Slicer
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          SPS does yearly surveys of students known as Panorama covering a wide
          range of data about their perceptions of the school. This tool faciliates
          comparing different schools. Most useful during school choice.
        </Typography>
      </>
    </ActionAreaCard>
  );
}

export default function Page() {
  return (
    <>
      <Stack direction="row" gap={2} sx={{margin: "5ex", justifyContent: "center", flexWrap: 'wrap' }}>
        <ActionAreaCard
          imageUrl="/assets/data-app.png"
          href="/data"
          altText="Link to the data archives">
          <>
            <Typography gutterBottom variant="h4" component="div">
              Raw Data, Maps, etc
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              A repository of data about SPS or education in the state in
              general. This includes PRRs, old Budget Books, interactive Maps
              by Beth Day as well as joined + cleaned data from various
              sources such as OSPI. If you want to do your own data analysis,
              start here.
            </Typography>
          </>
        </ActionAreaCard>
        <ActionAreaCard
          imageUrl="/assets/transcripts-app.png"
          href="https://transcripts.sps-by-the-numbers.com"
          altText="Link to the school board and city coucil transcription app">
          <>
            <Typography gutterBottom variant="h4" component="div">
              Transcripts
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Fully Searchable archive of transcipts for many years of SPS board meetings and 
              Seattle City Council meetings. The transcripts produce links to the sentence
              which is useful for citation. There is also machine translation into other languages.
              Trascripts are created using WhisperX so there may be AI transcription issues but
              overall it is accurate enough.
            </Typography>
          </>
        </ActionAreaCard>

        <ActionAreaCard
          imageUrl="/assets/finance-app.png"
          href="/finance/vitals"
          altText="Link to the dashboard of OSPI financial data for all districts in the state">
          <>
            <Typography gutterBottom variant="h4" component="div">
              Finance Dashboard
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Interactive dashboard of OSPI Finance + staffing data for the entire state.
              Allows explortation of school budgets, actual spends, enrollment,
              and staffing in roles by generated faceted graphs that can be
              filtered on varous OSPI properties such as activity, programs.
              This is the first place to start to understand finances of
              your district.
            </Typography>
          </>
        </ActionAreaCard>

        <ActionAreaCard
          imageUrl="/assets/transportation-app.png"
          href="/analyses/yellow_bus_ledger.html"
          altText="Link to the WA State Transportation Dashboard">
          <>
            <Typography gutterBottom variant="h4" component="div">
              WA State Transportation Dashboard
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Interactive comparison of pupil transportation funding and
              spending across all 315 Washington school districts. Explore
              STARS allotments, contract overages, and ridership trends.
            </Typography>
          </>
        </ActionAreaCard>

        <ActionAreaCard
          imageUrl="/assets/stars-exploiter-app.png"
          href="/analyses/stars-exploiter.html"
          altText="Link to the STARS Exploiter dashboard">
          <>
            <Typography gutterBottom variant="h4" component="div">
              STARS Exploiter
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              An interactive tool for understanding the inputs to
              Washington&apos;s STARS pupil transportation funding formula
              and which changes actually move district revenue. Tweak
              ridership, routes, and route characteristics to see how each
              lever feeds the allotment math.
            </Typography>
          </>
        </ActionAreaCard>

        <ActionAreaCard
          imageUrl="/assets/analyses-app.png"
          href="/analyses"
          altText="Links to major analyses and insteresting articles">
          <>
            <Typography gutterBottom variant="h4" component="div">
              Analyses Archive
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Links to analyses, write-ups, and interesting documents worth highlighting.
            </Typography>
          </>
        </ActionAreaCard>

      </Stack>
      <BottomNav />
    </>
  );
}
