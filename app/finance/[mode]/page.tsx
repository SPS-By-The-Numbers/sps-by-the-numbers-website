import DashboardSwitcher from './DashboardSwitcher';
import FinanceNav from 'components/finance/FinanceNav';
import { Metadata } from 'next'

import "styles/finance-dashboard.scss"
import "styles/hc-ba-history.scss"

type AppRoutes = '/finance/[mode]';

export const metadata: Metadata = {
  title: "Washington School District Financial Data Dashboard",
  description: 'Dashboard centralizing and joining bunches of official data to make it more usable.',
};

export default async function Page(props: PageProps<'/finance/[mode]'>) {
  const { mode } = await props.params;
  const query = await props.searchParams; // TODO: Just do this in the DashboardSwitcher.
  return (
    <>
      <FinanceNav />
      <DashboardSwitcher  ccddd={parseInt(query['ccddd'] ?? '17001')} mode={mode} />
    </>
  );
}
