import EnrollmentDashboard from './EnrollmentDashboard';

export default async function EnrollmentPage({ params }: { params: Promise<{ ccddd: string }> }) {
  const { ccddd } = await params;

  return (
    <EnrollmentDashboard />
  )
}
