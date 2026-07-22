import { Metadata } from "next";
import RevenuesPage from "./RevenuesPage";

export const metadata: Metadata = {
  title: "Revenues Dashboard for Washingtion State Schools",
  description:
    "Allows for analysis and comparison of historical general fund revenues on all school districts.",
};

export default async function Page() {
  return <RevenuesPage />;
}
