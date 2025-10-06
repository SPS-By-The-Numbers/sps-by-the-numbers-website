import type { DatasetSettings } from 'app/finance/_widgets/SettingsContents';
import type Dashboards from '@highcharts/dashboards';

type HighchartsComponentConfig = {
  gui: Dashboards.Board.GUIOptions;
  components: Array<Dashboards.Component.Options>;
};

type OptionalHighchartsComponentConfig = HighchartsComponentConfig | undefined;

export function makeOneDatasetFacetedDashboard(datasetSettings, componentGenerator) : OptionalHighchartsComponentConfig {
  const cells = new Array<any>;  // TODO: Remove this any
  const components = new Array<Dashboards.Component.Options>;

  for (const cellOptions of componentGenerator(datasetSettings)) {
    cells.push({id: cellOptions.renderTo})
    components.push(cellOptions);
  }

  const gui : Dashboards.Board.GUIOptions = {
    layouts: [
      {
        rows: [
          {
            cells
          }
        ]
      },
    ]
  };

  return {gui, components};
}

export function makeMultipleDatasetFacetedDashboard(datasetSettingsList, componentGenerator) : OptionalHighchartsComponentConfig {
  // TODO: Remove this any
  let rows = new Array<any>;
  const components = new Array<Dashboards.Component.Options>;

  for (const datasetSettings of datasetSettingsList) {
    const allCells = componentGenerator(datasetSettings);
    for (const i in allCells) {
      const cellOptions = allCells[i];
      rows[i] = rows[i] || {cells: new Array<any>};
      rows[i].cells.push({id: cellOptions.renderTo})
      components.push(cellOptions);
    }
  }

  const gui : Dashboards.Board.GUIOptions = {
    layouts: [
      {
        rows,
      },
    ]
  };

  return {gui, components};
}

// Returns {gui, components} which are compatible for use with Highcharts Dashboards options.
//
// If there is only one dataset, all facets are in one long flex row.
//
// If there are multiple datasets, each row correponds to one facet and each
// dataset is in one column.
export function makeDatasetFacetedDashboard<T extends DatasetSettings>(
      datasetSettingsList: Array<T>,
      componentGenerator: (datasetSettings: T) => Array<Dashboards.Component.Options>
  ) : OptionalHighchartsComponentConfig {
  if (datasetSettingsList.length == 0) {
    // TODO: Render no data. Or maybe consider throwing.
    return undefined;
  }

  if (datasetSettingsList.length == 1) {
    return makeOneDatasetFacetedDashboard(datasetSettingsList[0], componentGenerator);
  } else {
    return makeMultipleDatasetFacetedDashboard(datasetSettingsList, componentGenerator);
  }
}
