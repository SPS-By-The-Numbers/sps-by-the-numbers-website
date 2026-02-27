import { Metadata } from "next";
import EnrollmentPage from "./EnrollmentPage";

export const metadata: Metadata = {
  title: "Enrollment Dashboard for Washingtion State Schools",
  description:
    "Gives detailed breakdown of Enrollment over the years.",
};

export default async function Page() {
  return (
    <EnrollmentPage />
  );
}
