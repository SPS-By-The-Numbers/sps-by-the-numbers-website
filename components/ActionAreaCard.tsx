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
  title: string;
  description: string;
  altText: string;
  children: React.ReactNode;
};

export default function ActionAreaCard({imageUrl, href, altText, title, children} : Props) {
  return (
    <Card sx={{ maxWidth: 400 }}>
      <CardActionArea component={NextLink}  href={href}>
        <CardMedia
          component="img"
          height="300"
          image={imageUrl}
          alt={altText}
        />
        <CardContent>
          {children}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
