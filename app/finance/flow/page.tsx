import { Metadata } from "next";
import FlowPage from "./FlowPage";

export const metadata: Metadata = {
  title: "Money Flows for Washington State Schools",
  description:
    "Interactive Sankey tracing general fund revenue sources through programs, activities, and spending categories for a school district.",
};

export default async function Page() {
  return <FlowPage />;
}
