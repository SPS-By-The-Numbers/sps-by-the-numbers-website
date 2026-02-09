"use client";

import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import NextLink from "next/link";
import React from 'react';

type Props = {
  imageUrl: string;
  href: string;
  altText: string;
  children: React.ReactNode;
};

export default function ActionAreaCard({imageUrl, href, altText, children} : Props) {
  return (
    <Card sx={{ maxWidth: 400 }}>
      <CardActionArea component={NextLink}  href={href}>
        <CardMedia
          component="img"
          height="250"
          image={imageUrl}
          alt={altText}
          sx={{
            padding: 1,
            backgroundColor: "#dfdfdf",
            borderBottom: 1,
          }}
        />
        <CardContent>
          {children}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
