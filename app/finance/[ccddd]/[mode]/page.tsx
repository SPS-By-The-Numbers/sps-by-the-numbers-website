import DashboardSwitcher from './DashboardSwitcher';
import FinanceNav from 'components/finance/FinanceNav';
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Washington School District Financial Data Dashboard",
  description: 'Dashboard centralizing and joining bunches of official data to make it more usable.',
};

export default async function Page(props: PageProps<'/finance/[ccddd]/[mode]'>) {
  const { ccddd, mode } = await props.params;
  const query = await props.searchParams;
  return (
    <>
      <FinanceNav />
      <DashboardSwitcher  ccddd={parseInt(ccddd)} mode={mode} />
    </>
  );
}
