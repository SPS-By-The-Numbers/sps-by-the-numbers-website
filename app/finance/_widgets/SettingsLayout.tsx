'use client';

import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import SettingsContents from 'app/finance/_widgets/SettingsContents';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import type { ReactNode, ComponentType } from 'react';
import type { SettingsRenderComponentType, DatasetSettings } from 'app/finance/_widgets/SettingsContents';

const drawerWidth = 240;

interface SettingsLayoutProps<SettingsType extends DatasetSettings> {
  allDatasetSettings: Array<SettingsType>;
  setAllDatasetSettings: (v: Array<SettingsType>) => void;
  settingsContentsComponents: Array<SettingsRenderComponentType<any>>;

  children : ReactNode;
}

function DatasetAccordion<T extends DatasetSettings>(
    {datasetSettings, setDatasetSettings, settingsContentsComponents}) {
  return (
    <Accordion defaultExpanded>
      <AccordionSummary
        expandIcon={<ArrowDropDownIcon />}
        aria-controls={`${datasetSettings.id}`}
        id={`panel-${datasetSettings.id}-header`}
      >
        <Typography component="span">{datasetSettings.name}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <SettingsContents
          datasetSettings={datasetSettings}
          setDatasetSettings={setDatasetSettings}
          components={settingsContentsComponents}
        />
      </AccordionDetails>
    </Accordion>
  );
}

function DrawerContents<T extends DatasetSettings>(
    {allDatasetSettings, updateDatasetSettings, settingsContentsComponents}) {
  const panels = allDatasetSettings.map(
    (datasetSettings, index) => (
      <DatasetAccordion
          key={index}
          datasetSettings={datasetSettings}
          setDatasetSettings={v => updateDatasetSettings(index, v)}
          settingsContentsComponents={settingsContentsComponents}
          />
    ));
  return (
    <div>
      {panels}
    </div>
  );
}

export default function SettingsLayout<SettingsType extends DatasetSettings>(props: SettingsLayoutProps<SettingsType>) {
  const {allDatasetSettings, setAllDatasetSettings, settingsContentsComponents, children} = props;
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
          settingsContentsComponents={settingsContentsComponents}
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
        sx={{ flexGrow: 1, p: 0, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
      >
        {children}
      </Box>
    </Box>
  );
}
