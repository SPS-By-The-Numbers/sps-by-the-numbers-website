import DistrictDashboard from 'components/finance/DistrictDashboard';

export default async function EnrollmentPage({ params }: { params: Promise<{ ccddd: string }> }) {
  const { ccddd } = await params;

  return (
    <DistrictDashboard />
  )
}
