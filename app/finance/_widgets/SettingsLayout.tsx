"use client";

// SettingsLayout defines the basic layout of a page where there is a left
// settings drawer with one "context" setting box at the top and a series
// of "dataset" settings under. The render of each setting type is controlled
// by an array of SettingsContents.
//
// The SettingsLayout keeps state in the URL parameters allowing for semantic
// URLs that encode the current page configuration. Please keep URL length in
// mind when adding settings. In particular, skew towards smaller numeric codes
// for values as the filter encoding format is especially efficient at
// representing a selection of binary filters with identifiers from [0, 119].
//
// See utilties/number_set.ts for more info.

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
import type { SettingsRenderComponentType } from "app/finance/_widgets/SettingsContents";
import type {
  BaseSettings,
  SettingsSerializer,
} from "app/finance/_settings/base_settings";

const drawerWidthPx = 240;

interface SettingsLayoutProps<
  SettingsType extends BaseSettings,
  ContextSettingsType extends BaseSettings,
> {
  settingsSerializer: SettingsSerializer<SettingsType, ContextSettingsType>;

  contextSettings: ContextSettingsType;
  contextSettingsComponents: Array<SettingsRenderComponentType<any, any>>;

  allSettings: Array<SettingsType>;
  settingsContentsComponents: Array<SettingsRenderComponentType<any, any>>;

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
  contextSettings,
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
          contextSettings={contextSettings}
          settings={settings}
          setSettings={setSettings}
          components={settingsContentsComponents}
        />
      </AccordionDetails>
    </Accordion>
  );
}

function DrawerContents({
  contextSettings,
  setContextSettings,
  contextSettingsComponents,
  allSettings,
  updateAllSettings,
  settingsContentsComponents,
  removeSetting,
  sx,
}) {
  let contextSettingsPanel: ReactNode;
  if (contextSettingsComponents.length > 0) {
    contextSettingsPanel = (
      <DatasetAccordion
        contextSettings={contextSettings}
        settings={contextSettings}
        titlePrefix=""
        removeSelf={undefined}
        setSettings={setContextSettings}
        settingsContentsComponents={contextSettingsComponents}
      />
    );
  }
  const useEmoji = allSettings.length > 1;
  const panels = allSettings.map((settings, index) => (
    <DatasetAccordion
      key={settings.id}
      titlePrefix={useEmoji ? toEmojiPrefix(index) : ""}
      contextSettings={contextSettings}
      settings={settings}
      removeSelf={() => removeSetting(index)}
      setSettings={(v) => updateAllSettings(index, v)}
      settingsContentsComponents={settingsContentsComponents}
    />
  ));
  return (
    <Box sx={sx}>
      {contextSettingsPanel}
      {panels}
    </Box>
  );
}

export default function SettingsLayout<
  SettingsType extends BaseSettings,
  ContextSettingsType extends BaseSettings,
>(props: SettingsLayoutProps<SettingsType, ContextSettingsType>) {
  const {
    settingsSerializer,
    contextSettings,
    contextSettingsComponents,
    allSettings,
    settingsContentsComponents,
    children,
  } = props;
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const [nextSettingId, setNextSettingId] = React.useState(1);
  // Shows the "Updating" overlay while a settings change is being applied.
  // Applying a change re-renders the dashboard, whose data crunching
  // (arquero + chart config) runs synchronously and freezes the main thread —
  // so a CSS spinner would just stall. Instead we block interaction with a
  // static overlay and, crucially, let the browser PAINT it before kicking off
  // the blocking navigation (see the double rAF below).
  const [updating, setUpdating] = React.useState(false);

  // Clear the overlay once the new settings have flowed back in as props (which
  // only happens after the blocking recompute has committed). The safety
  // timeout guarantees the overlay can never get permanently stuck (e.g. if a
  // navigation resolves to the same URL and no re-render occurs).
  React.useEffect(() => {
    setUpdating(false);
  }, [allSettings, contextSettings]);
  React.useEffect(() => {
    if (!updating) {
      return;
    }
    const timer = setTimeout(() => setUpdating(false), 5000);
    return () => clearTimeout(timer);
  }, [updating]);

  const navigateToNewSettings = (
    newContextSettings: ContextSettingsType,
    newAllSettings: Array<SettingsType>,
  ) => {
    const queries = new Array<string>();
    for (const settingsQuery of settingsSerializer.serialize(newAllSettings)) {
      if (settingsQuery) {
        queries.push(`d=${settingsQuery}`);
      }
    }
    const contextQuery =
      settingsSerializer.serializeContext(newContextSettings);
    if (contextQuery) {
      queries.push(`c=${contextQuery}`);
    }

    if (queries.length !== 0) {
      const url = `${pathname}?${queries.join("&")}`;
      setUpdating(true);
      // Defer the (main-thread-blocking) navigation until after the overlay has
      // painted. The first rAF fires before the next paint; the nested rAF
      // fires after it, by which point the overlay is on screen.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          router.replace(url);
        });
      });
    }
  };

  const updateAllSettings = (i, v) => {
    const newAllSettings = [...allSettings];
    newAllSettings[i] = v;
    navigateToNewSettings(contextSettings, newAllSettings);
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
    navigateToNewSettings(contextSettings, newAllSettings);
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
        contextSettings={contextSettings}
        setContextSettings={(newContextSettings) =>
          navigateToNewSettings(newContextSettings, allSettings)
        }
        contextSettingsComponents={contextSettingsComponents}
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
        sx={{ width: { sm: drawerWidthPx }, flexShrink: { sm: 0 } }}
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
              width: drawerWidthPx,
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
              width: drawerWidthPx,
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
          // Default flex-item min-width is auto (= min-content), which
          // would let the dashboard's intrinsic content width (e.g. a
          // wide context band) push this Box past the viewport on
          // mobile. minWidth: 0 + overflow: hidden caps the Box at the
          // available row width and contains any horizontal overflow
          // inside the inner scroll containers.
          minWidth: 0,
          overflow: "hidden",
          p: 0,
          width: { sm: `calc(100% - ${drawerWidthPx}px)` },
        }}
      >
        {children}
      </Box>
      {updating && (
        <Box
          // Full-viewport blocker: covers the drawer and the content, so every
          // control is inert until the update finishes. No spinner — the main
          // thread is frozen during the recompute, so animation would stall.
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: (theme) => theme.zIndex.modal + 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0, 0, 0, 0.35)",
            cursor: "wait",
          }}
        >
          <Box
            sx={{
              px: 3,
              py: 2,
              borderRadius: 1,
              boxShadow: 6,
              backgroundColor: "background.paper",
            }}
          >
            <Typography variant="h6" component="p">
              Updating…
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}
