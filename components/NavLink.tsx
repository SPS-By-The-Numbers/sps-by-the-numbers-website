'use client'

import { usePathname } from 'next/navigation';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import NextLink from 'next/link';

import type { ReactNode } from 'react';
import type { SxProps, Theme } from '@mui/material';

export default function NavLink({href, children, sx=[]} : {href: string, children: ReactNode, sx?: SxProps<Theme>}) {
  const pathname = usePathname();

  // TODO: Client-side navigation by using component={NextLink} causes the page to
  // chug like mad on rerender. Something is wrong with highcharts there. I think we
  // need to explicitly teardown the old board.
  return (
    <Link
        href={href}
        underline="none"
        component={NextLink}
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
          fontSize: 'nav.fontSize',
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

