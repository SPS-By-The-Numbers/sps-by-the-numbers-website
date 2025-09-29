'use client';

import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import AppBar from '@mui/material/AppBar';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import SettingsIcon from '@mui/icons-material/Settings';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import type { ReactNode, ComponentType } from 'react';

const drawerWidth = 240;

export interface DatasetSettings {
  name: string;
  id: string;
};

type SettingsRenderComponentType<T extends DatasetSettings> = ComponentType<{ datasetSettings: T, setDatasetSettings: (newSettings: T) => void }>;

interface SettingsLayoutProps<SettingsType extends DatasetSettings> {
  allDatasetSettings: Array<SettingsType>;
  setAllDatasetSettings: (v: Array<SettingsType>) => void;
  SettingsRenderComponent: SettingsRenderComponentType<SettingsType>;
  children : ReactNode;
}

interface DatasetAccordionProps<T extends DatasetSettings> {
  datasetSettings: T;
  setDatasetSettings: (newSettings: T) => void;
  SettingsRenderComponent: SettingsRenderComponentType<T>;
}

interface DrawerContentsProps<T extends DatasetSettings> {
  allDatasetSettings: Array<T>;
  updateDatasetSettings: (i: number, v: T) => void;
  SettingsRenderComponent: SettingsRenderComponentType<T>;
}

function DatasetAccordion<T extends DatasetSettings>(
    {datasetSettings, setDatasetSettings, SettingsRenderComponent} : DatasetAccordionProps<T>) {
  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ArrowDownwardIcon />}
        aria-controls={`${datasetSettings.id}`}
        id={`panel-${datasetSettings.id}-header`}
      >
        <Typography component="span">{datasetSettings.name}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <SettingsRenderComponent datasetSettings={datasetSettings} setDatasetSettings={setDatasetSettings} />
      </AccordionDetails>
    </Accordion>
  );
}

function DrawerContents<T extends DatasetSettings>(
    {allDatasetSettings, updateDatasetSettings, SettingsRenderComponent} : DrawerContentsProps<T>) {
  const panels = allDatasetSettings.map(
    (datasetSettings, index) => (
      <DatasetAccordion
          key={index}
          datasetSettings={datasetSettings}
          setDatasetSettings={v => updateDatasetSettings(index, v)}
          SettingsRenderComponent={SettingsRenderComponent}
          />
    ));
  return (
    <div>
      {panels}
    </div>
  );
}

export default function SettingsLayout<T extends DatasetSettings>(props: SettingsLayoutProps<T>) {
  const {allDatasetSettings, setAllDatasetSettings, SettingsRenderComponent, children} = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);

  const updateDatasetSettings = (i, v) => {
    const newSettings = [...allDatasetSettings];
    newSettings[i] = v;
    setAllDatasetSettings(newSettings);
  };

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  const drawer = (
    <div>
      <Toolbar />
      <DrawerContents
          allDatasetSettings={allDatasetSettings}
          updateDatasetSettings={updateDatasetSettings}
          SettingsRenderComponent={SettingsRenderComponent}
      />
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="graph settings"
      >
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          slotProps={{
            root: {
              keepMounted: true, // Better open performance on mobile.
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{ flexGrow: 1, p: 0, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        {children}
      </Box>
    </Box>
  );
}
