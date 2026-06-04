import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type Props = {
  heading: string;
  count?: number;
  blurb?: React.ReactNode;
  children: React.ReactNode;
};

export default function Section({ heading, count, blurb, children }: Props) {
  return (
    <Stack spacing={1}>
      <Stack direction="row" alignItems="baseline" spacing={1}>
        <Typography component="h2" variant="h5">{heading}</Typography>
        {count != null && (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            ({count.toLocaleString()} {count === 1 ? "file" : "files"})
          </Typography>
        )}
      </Stack>
      {blurb && (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {blurb}
        </Typography>
      )}
      {children}
    </Stack>
  );
}
