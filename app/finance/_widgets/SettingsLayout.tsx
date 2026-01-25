"use client";

import * as React from "react";
import { toEmojiPrefix } from "utilities/emoji";
import { useRouter, usePathname } from "next/navigation";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import AddIcon from "@mui/icons-material/Add";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CloseIcon from "@mui/icons-material/Close";
import Drawer from "@mui/material/Drawer";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import SettingsContents from "app/finance/_widgets/SettingsContents";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import type { ReactNode, ComponentType } from "react";
import type {
  SettingsRenderComponentType,
  BaseSettings,
} from "app/finance/_widgets/SettingsContents";

const drawerWidth = 240;

export type SettingsSerializer<
  SettingsType extends BaseSettings,
  SharedSettingsType extends BaseSettings,
> = {
  serialize(allSettings: Array<SettingsType>): Array<string>;
  serializeShared(sharedSettings: SharedSettingsType): string;
};

interface SettingsLayoutProps<
  SettingsType extends BaseSettings,
  SharedSettingsType extends BaseSettings,
> {
  settingsSerializer: SettingsSerializer<SettingsType, SharedSettingsType>;

  sharedSettings: SharedSettingsType;
  sharedSettingsComponents: Array<SettingsRenderComponentType<any>>;

  allSettings: Array<SettingsType>;
  settingsContentsComponents: Array<SettingsRenderComponentType<any>>;

  children: ReactNode;
}

function MaybeCloseButton({ settings, removeSelf }) {
  const cannotClose = settings.id === 0 || removeSelf === undefined;
  return (
    <IconButton
      onClick={cannotClose ? undefined : removeSelf}
      size="small"
      sx={{ marginX: "0.5rem" }}
    >
      {cannotClose ? <Icon /> : <CloseIcon fontSize="inherit" />}
    </IconButton>
  );
}

function DatasetAccordion({
  sharedSettings,
  settings,
  setSettings,
  settingsContentsComponents,
  removeSelf,
  titlePrefix,
}) {
  return (
    <Accordion defaultExpanded>
      <Stack direction="row" sx={{ alignItems: "center" }}>
        <MaybeCloseButton settings={settings} removeSelf={removeSelf} />
        <AccordionSummary
          expandIcon={<ArrowDropDownIcon />}
          aria-controls={`${settings.id}`}
          id={`panel-${settings.id}-header`}
          sx={{
            paddingLeft: 0,
            paddingRight: 0,
          }}
        >
          <Typography component="span">
            {titlePrefix} {settings.name}
          </Typography>
        </AccordionSummary>
      </Stack>
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

function DrawerContents({
  sharedSettings,
  setSharedSettings,
  sharedSettingsComponents,
  allSettings,
  updateAllSettings,
  settingsContentsComponents,
  removeSetting,
  sx,
}) {
  let sharedSettingsPanel: ReactNode;
  if (sharedSettingsComponents) {
    sharedSettingsPanel = (
      <DatasetAccordion
        sharedSettings={sharedSettings}
        settings={sharedSettings}
        titlePrefix=""
        removeSelf={undefined}
        setSettings={setSharedSettings}
        settingsContentsComponents={sharedSettingsComponents}
      />
    );
  }
  const useEmoji = allSettings.length > 1;
  const panels = allSettings.map((settings, index) => (
    <DatasetAccordion
      key={settings.id}
      titlePrefix={useEmoji ? toEmojiPrefix(index) : ""}
      sharedSettings={sharedSettings}
      settings={settings}
      removeSelf={() => removeSetting(index)}
      setSettings={(v) => updateAllSettings(index, v)}
      settingsContentsComponents={settingsContentsComponents}
    />
  ));
  return (
    <Box sx={sx}>
      {sharedSettingsPanel}
      {panels}
    </Box>
  );
}

export default function SettingsLayout<
  SettingsType extends BaseSettings,
  SharedSettingsType extends BaseSettings,
>(props: SettingsLayoutProps<SettingsType, SharedSettingsType>) {
  const {
    settingsSerializer,
    sharedSettings,
    sharedSettingsComponents,
    allSettings,
    settingsContentsComponents,
    children,
  } = props;
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const [nextSettingId, setNextSettingId] = React.useState(1);

  const navigateToNewSettings = (newSharedSettings : SharedSettingsType, newAllSettings : Array<SettingsType>) => {
    const queries = new Array<string>();
    for (const settingsQuery of settingsSerializer.serialize(newAllSettings)) {
      queries.push(`d=${settingsQuery}`);
    }
    queries.push(`s=${settingsSerializer.serializeShared(newSharedSettings)}`);

    router.replace(`${pathname}?${queries.join("&")}`);
  };

  const updateAllSettings = (i, v) => {
    const newAllSettings = [...allSettings];
    newAllSettings[i] = v;
    navigateToNewSettings(sharedSettings, newAllSettings);
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

  const removeSetting = (index) => {
    // Clone the array to avoid messing up state.
    const newAllSettings = [...allSettings];
    newAllSettings.splice(index, 1);
    navigateToNewSettings(sharedSettings, newAllSettings);
  };

  const addComparison = () => {
    const id = `comp${nextSettingId}`;
    // Clone the most recent comparison into a new id.
    updateAllSettings(allSettings.length, { ...allSettings.at(-1), id });
    setNextSettingId(nextSettingId + 1);
  };

  const drawer = (
    <Stack sx={{ height: "100%" }}>
      <Toolbar />
      <DrawerContents
        sharedSettings={sharedSettings}
        setSharedSettings={(newSharedSettings) =>
          navigateToNewSettings(newSharedSettings, allSettings)
        }
        sharedSettingsComponents={sharedSettingsComponents}
        allSettings={allSettings}
        updateAllSettings={updateAllSettings}
        removeSetting={removeSetting}
        settingsContentsComponents={settingsContentsComponents}
        sx={{ overflowY: "scroll" }}
      />
      <Toolbar sx={{ justifyContent: "space-around" }}>
        <Button
          size="medium"
          variant="contained"
          startIcon={<AddIcon fontSize="inherit" />}
          onClick={addComparison}
        >
          Add Comparison
        </Button>
      </Toolbar>
    </Stack>
  );

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
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
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
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
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        sx={{
          height: "100%",
          flexGrow: 1,
          p: 0,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
