import { Metadata } from "next";
import AssessmentPage from "./AssessmentPage";

export const metadata: Metadata = {
  title: "Assessment Dashboard for Washingtion State Schools",
  description:
    "Gives detailed breakdown of Assessment over the years.",
};

export default async function Page() {
  return (
    <AssessmentPage />
  );
}
