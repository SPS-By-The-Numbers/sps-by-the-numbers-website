import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type Props = {
  title: string;
  intro: React.ReactNode;
  children: React.ReactNode;
};

export default function SectionPage({ title, intro, children }: Props) {
  return (
    <Container
      maxWidth="lg"
      component="main"
      sx={{ display: "flex", flexDirection: "column", my: 2, gap: 4 }}
    >
      <Stack spacing={1}>
        <Link href="/data" sx={{ fontSize: "0.9rem" }}>
          &larr; Data Archive
        </Link>
        <Typography component="h1" variant="h3">{title}</Typography>
        <Typography variant="body1" sx={{ color: "text.secondary" }}>
          {intro}
        </Typography>
      </Stack>
      <Stack spacing={4}>{children}</Stack>
    </Container>
  );
}
