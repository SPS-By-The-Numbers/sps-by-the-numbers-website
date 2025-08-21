import KeyStatsComponent from './KeyStatsComponent';
import BudgetVarianceComponent from './BudgetVarianceComponent';

// Run once per program to register the component.
export default function registerComponents(dashboards) {
  dashboards.ComponentRegistry.registerComponent('KeyStats', KeyStatsComponent);
  dashboards.ComponentRegistry.registerComponent('BudgetVariance', BudgetVarianceComponent);
}
