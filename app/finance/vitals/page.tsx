import { Metadata } from "next";
import VitalsPage from "./VitalsPage";

export const metadata: Metadata = {
  title: "School District Vitals Dashboard for Washingtion State Schools",
  description:
    "Shows key historical trends about enrollment, cashflow, and expenditures.",
};

export default async function Page() {
  return (
    <VitalsPage />
  );
}
