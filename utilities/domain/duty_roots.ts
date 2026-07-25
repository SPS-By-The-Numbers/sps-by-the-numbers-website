export type EmploymentClass = "certificated" | "classified";

export type DutyRootInfo = {
  duty_root: string;
  duty_category: string;
  duty_code: number;
  employment_class: EmploymentClass;
};

// Certificated vs classified is reliably determined by the 2-digit S-275 duty
// ROOT code, per OSPI's own definition (S-275 Executive Summary, "Questions":
// total certificated staff = certificated administrative [duty roots 11-25],
// certificated instructional [31-49, 63, 64], plus extracurricular [51],
// substitute teacher [52], and paid-leave [61] assignments). Everything else
// (the 90s: aides, crafts, office/clerical, service, technical, director, and
// classified-on-leave 90) is classified. This is authoritative and preferred
// over the free-text `duty_category` and over the S-275 duty SUFFIX (contract
// type), which does not reliably encode employment class.
// https://ospi.k12.wa.us/sites/default/files/2022-12/ExcSum.pdf (last page)
export function employmentClassForDutyRoot(dutyCode: number): EmploymentClass {
  const certificated =
    (dutyCode >= 11 && dutyCode <= 25) ||
    (dutyCode >= 31 && dutyCode <= 49) ||
    dutyCode === 51 ||
    dutyCode === 52 ||
    dutyCode === 61 ||
    dutyCode === 63 ||
    dutyCode === 64;
  return certificated ? "certificated" : "classified";
}

// Numeric codes for the employment class (a small enum of our own, used as the
// filter codes and the derived `employment_class_code` data column). Shared here
// so the filter and the data-derivation stay in lockstep.
export const CERTIFICATED_CLASS_CODE = 1;
export const CLASSIFIED_CLASS_CODE = 2;

export const EMPLOYMENT_CLASS_LABEL: Record<EmploymentClass, string> = {
  certificated: "Certificated",
  classified: "Classified",
};

export function employmentClassCodeForDutyRoot(dutyCode: number): number {
  return employmentClassForDutyRoot(dutyCode) === "certificated"
    ? CERTIFICATED_CLASS_CODE
    : CLASSIFIED_CLASS_CODE;
}

// A finer breakdown than the 2-way employment class, following OSPI's own
// certificated groupings, used as the Staffing "Staff Category" FACET: the
// certificated side splits into administrative / instructional / extracurricular
// / substitute / paid-leave, while everything classified stays a single group.
export type StaffCategory =
  | "cert_administrative"
  | "cert_instructional"
  | "extracurricular"
  | "substitute"
  | "paid_leave"
  | "classified";

// Numeric codes double as the facet's ordering (certificated groups first).
export const STAFF_CATEGORY_CODE: Record<StaffCategory, number> = {
  cert_administrative: 1,
  cert_instructional: 2,
  extracurricular: 3,
  substitute: 4,
  paid_leave: 5,
  classified: 6,
};

export const STAFF_CATEGORY_LABEL: Record<StaffCategory, string> = {
  cert_administrative: "Certificated Administrative",
  cert_instructional: "Certificated Instructional",
  extracurricular: "Extracurricular",
  substitute: "Substitute Teacher",
  paid_leave: "Paid Leave",
  classified: "Classified",
};

export function staffCategoryForDutyRoot(dutyCode: number): StaffCategory {
  if (dutyCode >= 11 && dutyCode <= 25) {
    return "cert_administrative";
  }
  if (
    (dutyCode >= 31 && dutyCode <= 49) ||
    dutyCode === 63 ||
    dutyCode === 64
  ) {
    return "cert_instructional";
  }
  if (dutyCode === 51) {
    return "extracurricular";
  }
  if (dutyCode === 52) {
    return "substitute";
  }
  if (dutyCode === 61) {
    return "paid_leave";
  }
  return "classified";
}

export function staffCategoryCodeForDutyRoot(dutyCode: number): number {
  return STAFF_CATEGORY_CODE[staffCategoryForDutyRoot(dutyCode)];
}

export function staffCategoryLabelForDutyRoot(dutyCode: number): string {
  return STAFF_CATEGORY_LABEL[staffCategoryForDutyRoot(dutyCode)];
}

const RAW_DUTY_ROOTS: Array<Omit<DutyRootInfo, "employment_class">> = [
  {
    duty_code: 11,
    duty_category: "administrator",
    duty_root: "Superintendent",
  },
  {
    duty_code: 12,
    duty_category: "administrator",
    duty_root: "Deputy/Assistant Superintendent",
  },
  {
    duty_code: 13,
    duty_category: "administrator",
    duty_root: "Other District Administrator",
  },
  {
    duty_code: 21,
    duty_category: "principal",
    duty_root: "Elementary Principal",
  },
  {
    duty_code: 22,
    duty_category: "principal",
    duty_root: "Elementary Vice Principal",
  },
  {
    duty_code: 23,
    duty_category: "principal",
    duty_root: "Secondary Principal",
  },
  {
    duty_code: 24,
    duty_category: "principal",
    duty_root: "Secondary Vice Principal",
  },
  {
    duty_code: 25,
    duty_category: "administrator",
    duty_root: "Other School Administrator",
  },
  {
    duty_code: 31,
    duty_category: "teacher",
    duty_root: "Elementary Homeroom Teacher",
  },
  {
    duty_code: 32,
    duty_category: "teacher",
    duty_root: "Secondary Teacher",
  },
  {
    duty_code: 33,
    duty_category: "teacher",
    duty_root: "Other Teacher",
  },
  {
    duty_code: 34,
    duty_category: "teacher",
    duty_root: "Elementary Specialist Teacher",
  },
  {
    duty_code: 39,
    duty_category: "health",
    duty_root: "Orientation and Mobility Specialist",
  },
  {
    duty_code: 40,
    duty_category: "support",
    duty_root: "Other Support Personnel",
  },
  {
    duty_code: 41,
    duty_category: "support",
    duty_root: "Library Media Specialist",
  },
  {
    duty_code: 42,
    duty_category: "mental health",
    duty_root: "Counselor",
  },
  {
    duty_code: 43,
    duty_category: "health",
    duty_root: "Occupational Therapist",
  },
  {
    duty_code: 44,
    duty_category: "mental health",
    duty_root: "Social Worker",
  },
  {
    duty_code: 45,
    duty_category: "health",
    duty_root: "Speech-Language Pathologist or Audiologist",
  },
  {
    duty_code: 46,
    duty_category: "health",
    duty_root: "Psychologist",
  },
  {
    duty_code: 47,
    duty_category: "health",
    duty_root: "Nurse",
  },
  {
    duty_code: 48,
    duty_category: "health",
    duty_root: "Physical Therapist",
  },
  {
    duty_code: 49,
    duty_category: "mental health",
    duty_root: "Behavior Analyst",
  },
  {
    duty_code: 51,
    duty_category: "extracurricular",
    duty_root: "Extracurricular (Base Contract)",
  },
  {
    duty_code: 52,
    duty_category: "teacher",
    duty_root: "Substitute Teacher",
  },
  {
    duty_code: 61,
    duty_category: "teacher",
    duty_root: "Certificated on Leave or Buy Back",
  },
  {
    duty_code: 63,
    duty_category: "teacher",
    duty_root: "Contractor Teacher",
  },
  {
    duty_code: 64,
    duty_category: "teacher",
    duty_root: "Contractor Educational Staff Associate",
  },
  {
    duty_code: 90,
    duty_category: "teacher",
    duty_root: "Classified on Leave or Buy Back",
  },
  {
    duty_code: 91,
    duty_category: "teacher",
    duty_root: "Aide",
  },
  {
    duty_code: 92,
    duty_category: "maintenance or custodial",
    duty_root: "Crafts or Trades",
  },
  {
    duty_code: 93,
    duty_category: "maintenance or custodial",
    duty_root: "Laborer",
  },
  {
    duty_code: 94,
    duty_category: "administrator",
    duty_root: "Office or Clerical",
  },
  {
    duty_code: 95,
    duty_category: "maintenance or custodial",
    duty_root: "Operator",
  },
  {
    duty_code: 96,
    duty_category: "professional",
    duty_root: "Professional",
  },
  {
    duty_code: 97,
    duty_category: "maintenance or custodial",
    duty_root: "Service Worker",
  },
  {
    duty_code: 98,
    duty_category: "technical",
    duty_root: "Technical",
  },
  {
    duty_code: 99,
    duty_category: "administrator",
    duty_root: "Director or Supervisor",
  },
];

// Stamp each duty root with its OSPI employment class (single source of truth:
// the range rule above), so consumers can read `employment_class` directly.
const ALL_DUTY_ROOTS: Array<DutyRootInfo> = RAW_DUTY_ROOTS.map((d) => ({
  ...d,
  employment_class: employmentClassForDutyRoot(d.duty_code),
}));

export default ALL_DUTY_ROOTS;
