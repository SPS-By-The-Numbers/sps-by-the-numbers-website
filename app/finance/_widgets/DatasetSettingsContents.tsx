import { useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import DownloadIcon from "@mui/icons-material/Download";
import Tooltip from "@mui/material/Tooltip";

import CurrencyNormalizationSelector from "app/finance/_widgets/CurrencyNormalizationSelector";
import DistrictSelector from "app/finance/_widgets/DistrictSelector";
import FilterGroupingSelector from "app/finance/_widgets/FilterGroupingSelector";
import StaffingNormalizationSelector from "app/finance/_widgets/StaffingNormalizationSelector";

import { fetchEndpoint } from "utilities/client/endpoint";
import { avroToRowsAndFields } from "utilities/client/FetchData";
import { rowsToCsv } from "utilities/client/csv";

import type { DatasetSettings } from "app/finance/_settings/dataset_settings";

export default function DatasetSettingsContents({
  settings,
  setSettings,
}: {
  settings: DatasetSettings;
  setSettings: (x: DatasetSettings) => void;
}) {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const downloadAllData = async () => {
    setDownloading(true);
    setDownloadError(null);
    try {
      const resp = await fetchEndpoint("bigsheet", "GET", {
        ccddd: settings.ccddd,
      });
      if (!resp.ok) {
        console.error(resp);
        throw new Error(resp.message || "Unable to generate download");
      }

      const dataResponse = await fetch(resp.data.dataUrl);
      const blob = await dataResponse.blob();
      const { fields, rows } = await avroToRowsAndFields(blob);
      const csv = rowsToCsv(fields, rows);

      const csvBlob = new Blob([csv], { type: "text/csv" });
      const objectUrl = URL.createObjectURL(csvBlob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `bigsheet_${settings.ccddd}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error(err);
      setDownloadError("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <>
      <DistrictSelector
        ccddd={settings.ccddd}
        onChange={(ccddd) =>
          setSettings(Object.assign({}, settings, { ccddd }))
        }
      />
      <Tooltip title="Downloads every row of data for this district as a CSV. The first download for a district can take a minute or two to generate.">
        <span>
          <Button
            size="small"
            variant="outlined"
            fullWidth
            startIcon={
              downloading ? (
                <CircularProgress size="1em" color="inherit" />
              ) : (
                <DownloadIcon fontSize="inherit" />
              )
            }
            disabled={downloading}
            onClick={downloadAllData}
          >
            {downloading ? "Generating…" : "Download all data (CSV)"}
          </Button>
        </span>
      </Tooltip>
      {downloadError && (
        <Alert severity="error" onClose={() => setDownloadError(null)}>
          {downloadError}
        </Alert>
      )}
      <FilterGroupingSelector
        label={`Filter Grouping`}
        filterGrouping={settings.filterGrouping}
        onChange={(filterGrouping) =>
          setSettings(Object.assign({}, settings, { filterGrouping }))
        }
      />
      <CurrencyNormalizationSelector
        label={`Money Normalization`}
        normalization={settings.currencyNormalization}
        onChange={(currencyNormalization) =>
          setSettings(Object.assign({}, settings, { currencyNormalization }))
        }
      />
      <StaffingNormalizationSelector
        label={`Staffing Normalization`}
        normalization={settings.staffingNormalization}
        onChange={(staffingNormalization) =>
          setSettings(Object.assign({}, settings, { staffingNormalization }))
        }
      />
    </>
  );
}
