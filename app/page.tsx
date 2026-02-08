import Stack from "@mui/material/Stack";
import ActionAreaCard from "components/ActionAreaCard";
import Typography from "@mui/material/Typography";

export default function Page() {
  return (
    <Stack direction="row" gap={2} sx={{margin: "5ex", justifyContent: "center" }}>
      <ActionAreaCard
        title="Transcripts"
        description="Link to the school board and city coucil transcription app"
        imageUrl="/assets/finance-app.png"
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
        title="Finance Dashboard"
        description="Link to the dashboard of OSPI financial data for all districts in the state"
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
        title="Data Archive"
        description="Link to the data archives"
        imageUrl="/assets/finance-app.png"
        href="/data"
        altText="Link to the data archives">
        <>
          <Typography gutterBottom variant="h4" component="div">
            Data Archives
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            If you want to do your own research or analysis, this is the
            place for you. It is an archive of PRRs, Budget Books, and
            normalized + joined data dumps from OSPI. Most of the difficulty
            in analysis is finding all the information that has been published
            on weird spots of the website; extracting it into some useful
            form; and then normalizing across different labeling methods, drifitng
            names, etc., so that the data can be joined. This archive is
            either primary source material or an normalization that lists
            how it was generated.
          </Typography>
        </>
      </ActionAreaCard>
    </Stack>
  );
}
