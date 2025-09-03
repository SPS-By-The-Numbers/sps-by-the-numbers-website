'use client'

import { usePathname } from 'next/navigation';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import NextLink from 'next/link';

import type { ReactNode } from 'react';
import type { SxProps, Theme } from '@mui/material';

export default function NavLink({href, children, sx=[]} : {href: string, children: ReactNode, sx?: SxProps<Theme>}) {
  const pathname = usePathname();

  return (
    <Link
        component={NextLink}
        href={href}
        underline="none"
        sx={[{
          display: "flex",
          alignSelf: "stretch",
        },
        ...(Array.isArray(sx) ? sx : [sx])
        ]}>
      <Button 
        sx={{
          backgroundColor: pathname.startsWith(href) ? 'primary.light' : 'primary.main',
          color: 'primary.contrastText',
          alignSelf: "stretch",
          textTransform: 'none',
          paddingX: "1rem",
          borderRadius: 0,
          ':hover': {
            bgcolor: 'primary.dark',
            color: 'white',
          },
        }}>
        {children}
      </Button>
    </Link>
  );
}

