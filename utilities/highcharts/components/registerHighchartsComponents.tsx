import KeyStatsComponent from './KeyStatsComponent';

// Run once per program to register the component.
export default function registerComponents(dashboards) {
  dashboards.ComponentRegistry.registerComponent('KeyStats', KeyStatsComponent);
}
