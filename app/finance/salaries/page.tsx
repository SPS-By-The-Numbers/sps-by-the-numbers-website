import { Metadata } from "next";
import SalariesPage from "./SalariesPage";

export const metadata: Metadata = {
  title: "Salaries Dashboard for Washington State Schools",
  description:
    "Every S-275 total final salary for a district and year, one column per person, grouped by duty title.",
};

export default async function Page() {
  return <SalariesPage />;
}
