'use client'

import * as Constants from 'config/constants';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FinanceSubNav from "app/finance/_widgets/FinanceSubNav";
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import Slide from '@mui/material/Slide';
import Link from '@mui/material/Link';
import NextLink from 'next/link';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import useScrollTrigger from '@mui/material/useScrollTrigger';

import type { SelectChangeEvent } from '@mui/material/Select';
import type { SxProps, Theme } from '@mui/material';

type Props = {
  sx?: SxProps<Theme>;
};

type NavApp = "none" | "finance" | "data" | "panorama" | "analyses";

// Configuration for a nav item to display in the header.
type NavConfig = {
  name: string;
  isAppPath: boolean;  // True if the navApp is part of the URL name.
  pathPrefix: string;  // The path that this config represents
  href?: string;       // Where this link goes. If undefined, the href is composed by the other values.
};

const HOME_NAV_CONFIGS : Array<NavConfig> = [
  { name: 'Transcripts',
    isAppPath: false,
    pathPrefix: 'v',
    href: 'https://transcripts.sps-by-the-numbers.com',
  },
  { name: 'Finances',
    isAppPath: false,
    pathPrefix: 'finance/vitals',
  },
  { name: 'Data',
    isAppPath: false,
    pathPrefix: 'data',
  },
  { name: 'Analyses',
    isAppPath: false,
    pathPrefix: 'analyses',
  },
  /*
  { name: 'Panorama Slicer',
    isAppPath: false,
    pathPrefix: 'panorama',
  },
  */
  { name: 'About',
    isAppPath: false,
    pathPrefix: 'about',
  }
];

const FINANCE_NAV_CONFIGS : Array<NavConfig> = [
  { name: 'Vitals',
    isAppPath: true,
    pathPrefix: 'vitals',
  },
  { name: 'Expenditures',
    isAppPath: true,
    pathPrefix: 'expenditures',
  },
  { name: 'Revenues',
    isAppPath: true,
    pathPrefix: 'revenues',
  },
  { name: 'Detailed Actuals',
    isAppPath: true,
    pathPrefix: 'detailedactuals',
  },
  { name: 'Staffing',
    isAppPath: true,
    pathPrefix: 'staffing',
  },
  { name: 'Enrollment',
    isAppPath: true,
    pathPrefix: 'enrollment',
  },
  { name: 'Assessments',
    isAppPath: true,
    pathPrefix: 'assessments',
  },
  { name: 'Correlations',
    isAppPath: true,
    pathPrefix: 'correlations',
  },
];

const NAV_CONFIGS_FOR_APP = {
  'none': HOME_NAV_CONFIGS,
  'finance': FINANCE_NAV_CONFIGS,
  'data': [],
  'analyses': [],
  'panorama': [],
};

function HideOnScroll(props) {
  const { children, window } = props;
  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
    disableHysteresis: true,
    threshold: 100,
  });

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children ?? <div />}
    </Slide>
  );
}
 
function NavLink({href, noHighlight, children, sx=[]} : {href: string, noHighlight?: boolean, children: React.ReactNode, sx?: SxProps<Theme>}) {
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
          backgroundColor: (!noHighlight && pathname.startsWith(href)) ? 'primary.light' : 'primary.main',
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

function makeHref(navApp: NavApp, navConfig: NavConfig) {
  if (navConfig.href) {
    return navConfig.href;
  }
  
  if (navConfig.isAppPath) {
    return `/${navApp}/${navConfig.pathPrefix}`;
  }

  return `/${navConfig.pathPrefix}`
}

function makeNavLinks(navApp: NavApp) {
  const navConfigs = NAV_CONFIGS_FOR_APP[navApp];

  return navConfigs.map((navConfig) => (
    <SingleDesktopLink
      key={navConfig.name}
      href={makeHref(navApp, navConfig)}
      name={navConfig.name}
    />
  ));
}

function makeMobileItems(navApp: NavApp, onClick : () => void) {
  const navConfigs = NAV_CONFIGS_FOR_APP[navApp];

  return navConfigs.map((navConfig) => (
    <MenuItem key={navConfig.name} onClick={onClick}>
      <Link
          href={makeHref(navApp, navConfig)}
          underline="none"
        >
        {navConfig.name}
      </Link>
    </MenuItem>
  ));
}

function MobileToggle({navApp} : {navApp: NavApp}) {
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
  };

  const menuSelected = () => {
    setMenuAnchorEl(null);
  };

  return (
    <Box sx={{ flexGrow: 0, display: { xs: 'flex', md: 'none' } }}>
      <IconButton
        size="large"
        aria-label="navigation menu"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={handleOpenMenu}
        color="inherit"
      >
        <MenuIcon />
      </IconButton>
      <Menu
        id="menu-appbar"
        anchorEl={menuAnchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
        sx={{ display: { xs: 'block', md: 'none' } }}
      >
        { makeMobileItems(navApp, menuSelected) }
      </Menu>
    </Box>
  );
}

function SingleDesktopLink({href, name} : {href: string, name: string}) {
  return (
    <NavLink href={href}>
      <Typography>
        {name}
      </Typography>
    </NavLink>
  );
}

function DesktopLinks({navApp} : {navApp: NavApp}) {
  const pathname = usePathname();

  return (
    <Stack direction="row"
        sx={{
          display: { xs: 'none', md: "flex"},
          alignSelf: "stretch",
          flexGrow: 2,
        }}>
      { makeNavLinks(navApp) }
    </Stack>
  );
}

function extractNavApp(parts: Array<string>) : NavApp {
  if (parts.length >= 2) {
    switch (parts[1]) {
      case "finance":
        return "finance" as const;

      case "data":
        return "data" as const;
    }
  }

  return "none" as const;
}

export default function PrimaryNav(props : Props) {
  const {sx = []} = props;
  const pathname = usePathname();
  const parts = pathname.split('/');
  const navApp = extractNavApp(parts);
  const suffixPath = parts.splice(2).join('/');

  return (
    <HideOnScroll {...props}>
      <AppBar
        position="sticky"
        color="primary"
        sx={[
          {
            zIndex: (theme) => theme.zIndex.drawer + 1,
          },
            ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >

        {/* Banner for test/staging */}
        <Box sx={{
          display: Constants.isProduction ? "none" : "flex",
          backgroundColor: "red",
          justifyContent: "center",
          width: "100%"
          }}>
          Dev Mode. Emulators used.
        </Box>

        <Toolbar
          variant="dense"
          sx={{
            backgroundColor: "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>

          {/* Home icon */}
          <NavLink
            href={Constants.HOME_URL}
            noHighlight={true}
            sx={{
              marginRight: ".5rem",
            }}>
            <img alt="Home" src={'/logo.png'} height={36} />
          </NavLink>

          <DesktopLinks navApp={navApp} />
          <MobileToggle navApp={navApp} />
        </Toolbar>
      </AppBar>
    </HideOnScroll>
  );
}
