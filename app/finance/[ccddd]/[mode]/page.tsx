import DashboardSwitcher from './DashboardSwitcher';
import FinanceNav from 'components/finance/FinanceNav';

export const metadata: Metadata = {
  title: "Washington State School Financial Data Dashboard",
  description: 'Dashboard centralizing and joining bunches of official data to make it more usable.',
};

type PageParams = {
  params: Promise<{ ccddd: string, mode: string  }>;
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function Page({ params, searchParams }: PageParams) {
  const { ccddd, mode } = await params;
  return (
    <>
      <FinanceNav />
      <DashboardSwitcher  ccddd={parseInt(ccddd)} mode={mode} />
    </>
  );
}
