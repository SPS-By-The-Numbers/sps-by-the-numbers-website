"use client";

import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import NextLink from "next/link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type Props = {
  href: string;
  title: string;
  blurb: string;
  count: number;
};

export default function SectionCard({ href, title, blurb, count }: Props) {
  return (
    <Card sx={{ width: "100%" }}>
      <CardActionArea component={NextLink} href={href}>
        <CardContent>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="baseline"
            sx={{ mb: 0.5 }}
          >
            <Typography variant="h5" component="h2">{title}</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {count.toLocaleString()} files
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {blurb}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
