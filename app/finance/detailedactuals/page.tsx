import { Metadata } from "next";
import DetailedActualsPage from "./DetailedActualsPage";

export const metadata: Metadata = {
  title: "Actual Spending Dashboard for Washingtion State Schools",
  description:
    "Gives detailed breakdown of actual spending using the NCES classification codes.",
};

export default async function Page() {
  return (
    <DetailedActualsPage />
  );
}
