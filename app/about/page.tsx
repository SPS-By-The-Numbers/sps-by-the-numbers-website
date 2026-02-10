import Container from '@mui/material/Container';

export default function Page() {
  return (
    <Container
      maxWidth="lg"
      component="main"
      sx={{ display: 'flex', flexDirection: 'column', my: 2, gap: 4 }}
    >
      About.
    </Container>
  );
}

