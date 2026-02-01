import { Metadata } from "next";
import CorrelationsPage from "./CorrelationsPage";

export const metadata: Metadata = {
  title: "Correlations Dashboard for Washingtion State Schools",
  description:
    "Shows enrollment details and correlations for Washingtion State Schools.",
};

export default async function Page(params: Params) {
  return (
    <CorrelationsPage />
  );
}
