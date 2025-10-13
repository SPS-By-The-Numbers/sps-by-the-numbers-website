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
import type { SettingsRenderComponentType, BaseSettings } from 'app/finance/_widgets/SettingsContents';

const drawerWidth = 240;

// TODO: Remove = {} and ?
interface SettingsLayoutProps<SettingsType extends BaseSettings, SharedSettingsType extends BaseSettings> {
  sharedSettings?: SharedSettingsType;
  setSharedSettings?: (x: SharedSettingsType) => void;
  sharedSettingsComponents?: Array<SettingsRenderComponentType<any>>;

  allSettings: Array<SettingsType>;
  setAllSettings: (v: Array<SettingsType>) => void;
  settingsContentsComponents: Array<SettingsRenderComponentType<any>>;

  children : ReactNode;
}

function DatasetAccordion<T extends BaseSettings>(
    {sharedSettings, settings, setSettings, settingsContentsComponents}) {
  return (
    <Accordion defaultExpanded>
      <AccordionSummary
        expandIcon={<ArrowDropDownIcon />}
        aria-controls={`${settings.id}`}
        id={`panel-${settings.id}-header`}
      >
        <Typography component="span">{settings.name}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <SettingsContents
          sharedSettings={sharedSettings}
          settings={settings}
          setSettings={setSettings}
          components={settingsContentsComponents}
        />
      </AccordionDetails>
    </Accordion>
  );
}

function DrawerContents<T extends BaseSettings>(
    { sharedSettings, setSharedSettings, sharedSettingsComponents,
      allSettings, updateAllSettings, settingsContentsComponents }) {
    let sharedSettingsPanel : ReactNode;
    if (sharedSettingsComponents) {
      sharedSettingsPanel = (
        <DatasetAccordion
          sharedSettings={sharedSettings}
          settings={sharedSettings}
          setSettings={setSharedSettings}
          settingsContentsComponents={sharedSettingsComponents}
        />
      );
    }
  const panels = allSettings.map(
    (settings, index) => (
      <DatasetAccordion
          key={index}
          sharedSettings={sharedSettings}
          settings={settings}
          setSettings={v => updateAllSettings(index, v)}
          settingsContentsComponents={settingsContentsComponents}
          />
    ));
  return (
    <div>
      {sharedSettingsPanel}
      {panels}
    </div>
  );
}

export default function SettingsLayout<SettingsType extends BaseSettings, SharedSettingsType extends BaseSettings>(props: SettingsLayoutProps<SettingsType, SharedSettingsType>) {
  const { sharedSettings, setSharedSettings, sharedSettingsComponents,
    allSettings, setAllSettings, settingsContentsComponents, children} = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);

  const updateAllSettings = (i, v) => {
    const newSettings = [...allSettings];
    newSettings[i] = v;
    setAllSettings(newSettings);
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
          sharedSettings={sharedSettings}
          setSharedSettings={setSharedSettings}
          sharedSettingsComponents={sharedSettingsComponents}

          allSettings={allSettings}
          updateAllSettings={updateAllSettings}
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
