import Paper from '@mui/material/Paper';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';

export default function Loading({text}) {
  const message = text ?? "Loading..."
  return (
    <>
      <LinearProgress />
      <Paper>
        <Typography
          component="h2"
          variant="h2"
          textAlign="center"
          style={{
            paddingTop: "1rem",
            paddingBottom: "1rem",
            fontSize: "1.5rem",
          }}
        >
          {message}
        </Typography>
      </Paper>
    </>
  )
}
