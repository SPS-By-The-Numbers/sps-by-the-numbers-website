import { Metadata } from "next";
import StaffingPage from "./StaffingPage";

export const metadata: Metadata = {
  title: "Staffing Dashboard for Washingtion State Schools",
  description:
    "Allows for anlaysis and comparison of historical staffing on all school districts.",
};

export default async function Page() {
  return (
    <StaffingPage />
  );
}
