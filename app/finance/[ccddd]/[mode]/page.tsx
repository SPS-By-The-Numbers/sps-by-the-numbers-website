import DashboardSwitcher from './DashboardSwitcher';
import FinanceNav from 'components/finance/FinanceNav';
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Washington State School Financial Data Dashboard",
  description: 'Dashboard centralizing and joining bunches of official data to make it more usable.',
};

type PageProps = {
  params: Promise<{ ccddd: string, mode: string  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function Page({ params, searchParams }: PageProps) {
  const { ccddd, mode } = await params;
  return (
    <>
      <FinanceNav />
      <DashboardSwitcher  ccddd={parseInt(ccddd)} mode={mode} />
    </>
  );
}
