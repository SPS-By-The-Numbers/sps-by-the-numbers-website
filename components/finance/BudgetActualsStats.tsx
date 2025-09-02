import type { DataFrame } from 'danfojs';

type BudgetActualsStatsParams = {
  title: string;
  primaryDf: DataFrame;
  secondaryDf: DataFrame;
};

export default function BudgetActualsStats() {
  const budgetLatest = 10;
  const actualsLatest = 20;
  const varianceLatest = -10;
  const budgetAvg = 10;
  const actualsAvg = 20;
  const varianceAvg = -10;
  return (
    <table className="budget-actuals-stats">
      <tr>
        <th>Summary</th>
        <th>Budget</th>
        <th>Actuals</th>
        <th>Variance</th>
      </tr>
      <tr>
        <td>latest <em>(avg)</em></td>
        <td>{budgetLatest} <em>({budgetAvg})</em></td>
        <td>{actualsLatest} <em>({actualsAvg})</em></td>
        <td>{varianceLatest} <em>({varianceAvg})</em></td>
      </tr>
    </table>
  );
}
