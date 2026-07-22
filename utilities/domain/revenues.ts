// OSPI SAFS General Fund revenue category and revenue account code -> label tables.
//
// Source of truth: BigQuery table `sps-btn-data.safs_f19x.general_fund_revenues`
// (statewide, all districts, all years present in the F196/F195 data). Pulled 2026-07-21 via:
//
//   bq query --use_legacy_sql=false 'SELECT DISTINCT category_code, category, revenue_code, revenue
//     FROM `sps-btn-data.safs_f19x.general_fund_revenues` ORDER BY revenue_code'
//
// This is real, verified data (183 distinct revenue_code rows, 9 categories) -- NOT a
// best-effort placeholder. Two known quirks in the source data, preserved here:
//
// 1. A number of `revenue`/`category` text fields contain a literal '?' character in place of
//    what is almost certainly an en-dash/hyphen separator (a mojibake artifact from OSPI's
//    original spreadsheet -> BigQuery ingestion, upstream of this codebase). Normalized to
//    ' - ' here for readability; the numeric codes themselves are untouched/authoritative.
// 2. Four revenue_codes (4109, 5700, 6109, 6210) have non-trivial real dollar amounts in the
//    table across multiple districts/years but NULL category/revenue text -- OSPI's own
//    source spreadsheet never assigned them a label. category_code for these four is inferred
//    from the code's leading digit (standard OSPI convention: revenue_code // 100 grouping)
//    and the label is a placeholder marked '[Unlabeled in OSPI source]'. If real data ever
//    shows meaningful amounts under these codes, verify against a fresh bq pull / OSPI SAFS
//    account manual before trusting the placeholder label in a dashboard.

export type RevenueCategoryInfo = {
  category_code: number;
  category: string;
};

export const ALL_REVENUE_CATEGORIES: Array<RevenueCategoryInfo> = [
  { category_code: 1000, category: "Local Taxes" },
  { category_code: 2000, category: "Local Non-tax" },
  { category_code: 3000, category: "State-General Purpose" },
  { category_code: 4000, category: "State-Special Purpose" },
  { category_code: 5000, category: "Federal-General Purpose" },
  { category_code: 6000, category: "Federal-Special Purpose" },
  { category_code: 7000, category: "Revenues from Other School Districts" },
  {
    category_code: 8000,
    category: "Revenues from Other Agencies and Associations",
  },
  { category_code: 9000, category: "Other Financing Sources" },
];

export type RevenueInfo = {
  serialization_code: number;
  revenue_code: number;
  revenue: string;
  category_code: number;
};

// serialization_code compresses the sparse 4-digit revenue_code space down to [0, 182] for
// compact URL encoding via number_set, mirroring utilities/domain/nces.ts. Assigned in
// revenue_code order; stable as long as entries are only ever appended, never reordered/removed.
export const ALL_REVENUES: Array<RevenueInfo> = [
  {
    serialization_code: 0,
    revenue_code: 1100,
    revenue: "Local Property Tax",
    category_code: 1000,
  },
  {
    serialization_code: 1,
    revenue_code: 1300,
    revenue: "Sale of Tax Title Property",
    category_code: 1000,
  },
  {
    serialization_code: 2,
    revenue_code: 1400,
    revenue: "Local in Lieu of Taxes",
    category_code: 1000,
  },
  {
    serialization_code: 3,
    revenue_code: 1500,
    revenue: "Timber Excise Tax",
    category_code: 1000,
  },
  {
    serialization_code: 4,
    revenue_code: 1600,
    revenue: "County-Administered Forests",
    category_code: 1000,
  },
  {
    serialization_code: 5,
    revenue_code: 1900,
    revenue: "Other Local Taxes",
    category_code: 1000,
  },
  {
    serialization_code: 6,
    revenue_code: 2100,
    revenue: "Tuition and Fees - Unassigned",
    category_code: 2000,
  },
  {
    serialization_code: 7,
    revenue_code: 2122,
    revenue: "Special Education - Infants and Toddlers - Tuition and Fees",
    category_code: 2000,
  },
  {
    serialization_code: 8,
    revenue_code: 2131,
    revenue: "Secondary Vocational Education - Tuition and Fees",
    category_code: 2000,
  },
  {
    serialization_code: 9,
    revenue_code: 2145,
    revenue: "Skill Center - Tuition and Fees",
    category_code: 2000,
  },
  {
    serialization_code: 10,
    revenue_code: 2171,
    revenue: "Traffic Safety - Education Fees",
    category_code: 2000,
  },
  {
    serialization_code: 11,
    revenue_code: 2173,
    revenue: "Summer School - Tuition and Fees",
    category_code: 2000,
  },
  {
    serialization_code: 12,
    revenue_code: 2186,
    revenue: "Community School - Tuition and Fees",
    category_code: 2000,
  },
  {
    serialization_code: 13,
    revenue_code: 2188,
    revenue: "Child Care - Tuition and Fees",
    category_code: 2000,
  },
  {
    serialization_code: 14,
    revenue_code: 2200,
    revenue: "Sales of Goods, Supplies, and Services - Unassigned",
    category_code: 2000,
  },
  {
    serialization_code: 15,
    revenue_code: 2231,
    revenue:
      "Secondary Vocational Education - Sales of Goods, Supplies, and Services",
    category_code: 2000,
  },
  {
    serialization_code: 16,
    revenue_code: 2245,
    revenue: "Skill Center - Sales of Goods, Supplies, and Services",
    category_code: 2000,
  },
  {
    serialization_code: 17,
    revenue_code: 2288,
    revenue: "Child Care - Sales of Goods, Supplies, and Services",
    category_code: 2000,
  },
  {
    serialization_code: 18,
    revenue_code: 2289,
    revenue:
      "Other Community Services - Sales of Goods, Supplies, and Services",
    category_code: 2000,
  },
  {
    serialization_code: 19,
    revenue_code: 2298,
    revenue: "School Food Services - Sales of Goods, Supplies, and Services",
    category_code: 2000,
  },
  {
    serialization_code: 20,
    revenue_code: 2300,
    revenue: "Investment Earnings",
    category_code: 2000,
  },
  {
    serialization_code: 21,
    revenue_code: 2400,
    revenue: "Interfund Loan Interest Earnings",
    category_code: 2000,
  },
  {
    serialization_code: 22,
    revenue_code: 2450,
    revenue: "Other Interest Earnings",
    category_code: 2000,
  },
  {
    serialization_code: 23,
    revenue_code: 2500,
    revenue: "Gifts, Grants, and Donations (Local)",
    category_code: 2000,
  },
  {
    serialization_code: 24,
    revenue_code: 2600,
    revenue: "Fines and Damages",
    category_code: 2000,
  },
  {
    serialization_code: 25,
    revenue_code: 2700,
    revenue: "Rentals and Leases",
    category_code: 2000,
  },
  {
    serialization_code: 26,
    revenue_code: 2800,
    revenue: "Insurance Recoveries",
    category_code: 2000,
  },
  {
    serialization_code: 27,
    revenue_code: 2900,
    revenue: "Local Support Non-Tax - Unassigned",
    category_code: 2000,
  },
  {
    serialization_code: 28,
    revenue_code: 2910,
    revenue: "E-Rate",
    category_code: 2000,
  },
  {
    serialization_code: 29,
    revenue_code: 2998,
    revenue: "Local School Food Services - non NSLP",
    category_code: 2000,
  },
  {
    serialization_code: 30,
    revenue_code: 3100,
    revenue: "Apportionment",
    category_code: 3000,
  },
  {
    serialization_code: 31,
    revenue_code: 3121,
    revenue: "Special Education - General Apportionment",
    category_code: 3000,
  },
  {
    serialization_code: 32,
    revenue_code: 3300,
    revenue: "Local Effort Assistance",
    category_code: 3000,
  },
  {
    serialization_code: 33,
    revenue_code: 3600,
    revenue: "State Forests",
    category_code: 3000,
  },
  {
    serialization_code: 34,
    revenue_code: 3900,
    revenue: "Other State General Purpose - Unassigned",
    category_code: 3000,
  },
  {
    serialization_code: 35,
    revenue_code: 4100,
    revenue: "Special Purpose - Unassigned",
    category_code: 4000,
  },
  {
    serialization_code: 36,
    revenue_code: 4109,
    revenue: "[Unlabeled in OSPI source] Reserve/Other (4109)",
    category_code: 4000,
  },
  {
    serialization_code: 37,
    revenue_code: 4121,
    revenue: "Special Education",
    category_code: 4000,
  },
  {
    serialization_code: 38,
    revenue_code: 4122,
    revenue: "Special Education - Infants and Toddlers - State",
    category_code: 4000,
  },
  {
    serialization_code: 39,
    revenue_code: 4126,
    revenue: "State Institutions - Special Education",
    category_code: 4000,
  },
  {
    serialization_code: 40,
    revenue_code: 4139,
    revenue: "Career Launch",
    category_code: 4000,
  },
  {
    serialization_code: 41,
    revenue_code: 4155,
    revenue: "Learning Assistance",
    category_code: 4000,
  },
  {
    serialization_code: 42,
    revenue_code: 4156,
    revenue: "State Institutions, Centers, and Homes - Delinquent",
    category_code: 4000,
  },
  {
    serialization_code: 43,
    revenue_code: 4158,
    revenue: "Special and Pilot Programs",
    category_code: 4000,
  },
  {
    serialization_code: 44,
    revenue_code: 4159,
    revenue: "Institutions - Juveniles in Adult Jails",
    category_code: 4000,
  },
  {
    serialization_code: 45,
    revenue_code: 4165,
    revenue: "Transitional Bilingual",
    category_code: 4000,
  },
  {
    serialization_code: 46,
    revenue_code: 4174,
    revenue: "Highly Capable",
    category_code: 4000,
  },
  {
    serialization_code: 47,
    revenue_code: 4188,
    revenue: "Child Care",
    category_code: 4000,
  },
  {
    serialization_code: 48,
    revenue_code: 4198,
    revenue: "School Food Services",
    category_code: 4000,
  },
  {
    serialization_code: 49,
    revenue_code: 4199,
    revenue: "Transportation - Operations",
    category_code: 4000,
  },
  {
    serialization_code: 50,
    revenue_code: 4300,
    revenue: "Other State Agencies - Unassigned",
    category_code: 4000,
  },
  {
    serialization_code: 51,
    revenue_code: 4321,
    revenue: "Special Education",
    category_code: 4000,
  },
  {
    serialization_code: 52,
    revenue_code: 4322,
    revenue: "Special Education - Infants and Toddlers - State",
    category_code: 4000,
  },
  {
    serialization_code: 53,
    revenue_code: 4326,
    revenue: "State Institutions - Special Education",
    category_code: 4000,
  },
  {
    serialization_code: 54,
    revenue_code: 4356,
    revenue: "State Institutions - Centers and Homes",
    category_code: 4000,
  },
  {
    serialization_code: 55,
    revenue_code: 4358,
    revenue: "Special and Pilot Programs",
    category_code: 4000,
  },
  {
    serialization_code: 56,
    revenue_code: 4365,
    revenue: "Transitional Bilingual",
    category_code: 4000,
  },
  {
    serialization_code: 57,
    revenue_code: 4388,
    revenue: "Child Care - Other State Agencies",
    category_code: 4000,
  },
  {
    serialization_code: 58,
    revenue_code: 4398,
    revenue: "School Food Services",
    category_code: 4000,
  },
  {
    serialization_code: 59,
    revenue_code: 4399,
    revenue: "Transportation - Operations",
    category_code: 4000,
  },
  {
    serialization_code: 60,
    revenue_code: 5200,
    revenue: "General Purpose Direct Federal Grants - Unassigned",
    category_code: 5000,
  },
  {
    serialization_code: 61,
    revenue_code: 5300,
    revenue: "Impact Aid - Maintenance and Operations",
    category_code: 5000,
  },
  {
    serialization_code: 62,
    revenue_code: 5329,
    revenue: "Impact Aid - Special Education Funding",
    category_code: 5000,
  },
  {
    serialization_code: 63,
    revenue_code: 5400,
    revenue: "Federal in Lieu of Taxes",
    category_code: 5000,
  },
  {
    serialization_code: 64,
    revenue_code: 5500,
    revenue: "Federal Forests",
    category_code: 5000,
  },
  {
    serialization_code: 65,
    revenue_code: 5600,
    revenue: "Qualified Bond Interest Credit - Federal",
    category_code: 5000,
  },
  {
    serialization_code: 66,
    revenue_code: 5700,
    revenue: "[Unlabeled in OSPI source] Reserve/Other (5700)",
    category_code: 5000,
  },
  {
    serialization_code: 67,
    revenue_code: 6100,
    revenue: "Special Purpose - OSPI Unassigned",
    category_code: 6000,
  },
  {
    serialization_code: 68,
    revenue_code: 6109,
    revenue: "[Unlabeled in OSPI source] Reserve/Other (6109)",
    category_code: 6000,
  },
  {
    serialization_code: 69,
    revenue_code: 6111,
    revenue: "Special Purpose - GEER",
    category_code: 6000,
  },
  {
    serialization_code: 70,
    revenue_code: 6112,
    revenue: "Special Purpose - ESSER II",
    category_code: 6000,
  },
  {
    serialization_code: 71,
    revenue_code: 6113,
    revenue: "Special Purpose - ESSER III",
    category_code: 6000,
  },
  {
    serialization_code: 72,
    revenue_code: 6114,
    revenue: "Special Purpose - ESSER III - Supplemental - Learning Loss",
    category_code: 6000,
  },
  {
    serialization_code: 73,
    revenue_code: 6118,
    revenue: "Special Purpose - Reserve G",
    category_code: 6000,
  },
  {
    serialization_code: 74,
    revenue_code: 6119,
    revenue: "Special Purpose - Reserve H",
    category_code: 6000,
  },
  {
    serialization_code: 75,
    revenue_code: 6121,
    revenue: "Special Education - Medicaid Reimbursements",
    category_code: 6000,
  },
  {
    serialization_code: 76,
    revenue_code: 6122,
    revenue:
      "Special Education - Infants and Toddlers - Medicaid Reimbursements",
    category_code: 6000,
  },
  {
    serialization_code: 77,
    revenue_code: 6123,
    revenue: "Special Education - ARP - IDEA",
    category_code: 6000,
  },
  {
    serialization_code: 78,
    revenue_code: 6124,
    revenue: "Special Education - Supplemental",
    category_code: 6000,
  },
  {
    serialization_code: 79,
    revenue_code: 6125,
    revenue: "Special Education - Infants and Toddlers - Federal",
    category_code: 6000,
  },
  {
    serialization_code: 80,
    revenue_code: 6138,
    revenue: "Secondary Vocational Education",
    category_code: 6000,
  },
  {
    serialization_code: 81,
    revenue_code: 6146,
    revenue: "Skill Center",
    category_code: 6000,
  },
  {
    serialization_code: 82,
    revenue_code: 6151,
    revenue: "ESEA Disadvantaged - Federal",
    category_code: 6000,
  },
  {
    serialization_code: 83,
    revenue_code: 6152,
    revenue: "Other Title Grants Under ESEA - Federal",
    category_code: 6000,
  },
  {
    serialization_code: 84,
    revenue_code: 6153,
    revenue: "ESEA Migrant - Federal",
    category_code: 6000,
  },
  {
    serialization_code: 85,
    revenue_code: 6154,
    revenue: "Reading First",
    category_code: 6000,
  },
  {
    serialization_code: 86,
    revenue_code: 6157,
    revenue: "Institutions - Neglected and Delinquent",
    category_code: 6000,
  },
  {
    serialization_code: 87,
    revenue_code: 6161,
    revenue: "Head Start",
    category_code: 6000,
  },
  {
    serialization_code: 88,
    revenue_code: 6162,
    revenue: "Math and Science - Professional Development",
    category_code: 6000,
  },
  {
    serialization_code: 89,
    revenue_code: 6164,
    revenue: "Limited English Proficiency",
    category_code: 6000,
  },
  {
    serialization_code: 90,
    revenue_code: 6167,
    revenue: "Indian Education - JOM",
    category_code: 6000,
  },
  {
    serialization_code: 91,
    revenue_code: 6168,
    revenue: "Indian Education - ED",
    category_code: 6000,
  },
  {
    serialization_code: 92,
    revenue_code: 6176,
    revenue: "Targeted Assistance",
    category_code: 6000,
  },
  {
    serialization_code: 93,
    revenue_code: 6178,
    revenue: "Youth Training Programs",
    category_code: 6000,
  },
  {
    serialization_code: 94,
    revenue_code: 6188,
    revenue: "Child Care",
    category_code: 6000,
  },
  {
    serialization_code: 95,
    revenue_code: 6189,
    revenue: "Other Community Services",
    category_code: 6000,
  },
  {
    serialization_code: 96,
    revenue_code: 6198,
    revenue: "School Food Services",
    category_code: 6000,
  },
  {
    serialization_code: 97,
    revenue_code: 6199,
    revenue: "Transportation - Operations",
    category_code: 6000,
  },
  {
    serialization_code: 98,
    revenue_code: 6200,
    revenue: "Direct Special Purpose Grants",
    category_code: 6000,
  },
  {
    serialization_code: 99,
    revenue_code: 6210,
    revenue: "[Unlabeled in OSPI source] Reserve/Other (6210)",
    category_code: 6000,
  },
  {
    serialization_code: 100,
    revenue_code: 6211,
    revenue: "Special Purpose - GEER",
    category_code: 6000,
  },
  {
    serialization_code: 101,
    revenue_code: 6212,
    revenue: "Special Purpose - ESSER II",
    category_code: 6000,
  },
  {
    serialization_code: 102,
    revenue_code: 6213,
    revenue: "Special Purpose - ESSER III",
    category_code: 6000,
  },
  {
    serialization_code: 103,
    revenue_code: 6214,
    revenue: "Special Purpose - ESSER III - Supplemental - Learning Loss",
    category_code: 6000,
  },
  {
    serialization_code: 104,
    revenue_code: 6218,
    revenue: "Special Purpose - Reserve G",
    category_code: 6000,
  },
  {
    serialization_code: 105,
    revenue_code: 6219,
    revenue: "Special Purpose - Reserve H",
    category_code: 6000,
  },
  {
    serialization_code: 106,
    revenue_code: 6221,
    revenue: "Special Education - Medicaid Reimbursements",
    category_code: 6000,
  },
  {
    serialization_code: 107,
    revenue_code: 6222,
    revenue:
      "Special Education - Infants and Toddlers - Medicaid Reimbursements",
    category_code: 6000,
  },
  {
    serialization_code: 108,
    revenue_code: 6223,
    revenue: "Special Education - ARP - IDEA",
    category_code: 6000,
  },
  {
    serialization_code: 109,
    revenue_code: 6224,
    revenue: "Special Education - Supplemental",
    category_code: 6000,
  },
  {
    serialization_code: 110,
    revenue_code: 6238,
    revenue: "Secondary Vocational Education",
    category_code: 6000,
  },
  {
    serialization_code: 111,
    revenue_code: 6246,
    revenue: "Skill Center",
    category_code: 6000,
  },
  {
    serialization_code: 112,
    revenue_code: 6251,
    revenue: "ESEA Disadvantaged - Federal",
    category_code: 6000,
  },
  {
    serialization_code: 113,
    revenue_code: 6252,
    revenue: "Other Title Grants Under ESEA - Federal",
    category_code: 6000,
  },
  {
    serialization_code: 114,
    revenue_code: 6253,
    revenue: "ESEA Migrant - Federal",
    category_code: 6000,
  },
  {
    serialization_code: 115,
    revenue_code: 6261,
    revenue: "Head Start",
    category_code: 6000,
  },
  {
    serialization_code: 116,
    revenue_code: 6262,
    revenue: "Math and Science - Professional Development",
    category_code: 6000,
  },
  {
    serialization_code: 117,
    revenue_code: 6267,
    revenue: "Indian Education - JOM",
    category_code: 6000,
  },
  {
    serialization_code: 118,
    revenue_code: 6268,
    revenue: "Indian Education - ED",
    category_code: 6000,
  },
  {
    serialization_code: 119,
    revenue_code: 6276,
    revenue: "Targeted Assistance",
    category_code: 6000,
  },
  {
    serialization_code: 120,
    revenue_code: 6278,
    revenue: "Youth Training Programs",
    category_code: 6000,
  },
  {
    serialization_code: 121,
    revenue_code: 6288,
    revenue: "Child Care",
    category_code: 6000,
  },
  {
    serialization_code: 122,
    revenue_code: 6289,
    revenue: "Other Community Services",
    category_code: 6000,
  },
  {
    serialization_code: 123,
    revenue_code: 6298,
    revenue: "School Food Services",
    category_code: 6000,
  },
  {
    serialization_code: 124,
    revenue_code: 6299,
    revenue: "Transportation - Operations",
    category_code: 6000,
  },
  {
    serialization_code: 125,
    revenue_code: 6300,
    revenue: "Federal Grants Through Other Entities - Unassigned",
    category_code: 6000,
  },
  {
    serialization_code: 126,
    revenue_code: 6310,
    revenue: "Medicaid Administrative Match",
    category_code: 6000,
  },
  {
    serialization_code: 127,
    revenue_code: 6311,
    revenue: "Special Purpose - GEER",
    category_code: 6000,
  },
  {
    serialization_code: 128,
    revenue_code: 6312,
    revenue: "Special Purpose - ESSER II",
    category_code: 6000,
  },
  {
    serialization_code: 129,
    revenue_code: 6313,
    revenue: "Special Purpose - ESSER III",
    category_code: 6000,
  },
  {
    serialization_code: 130,
    revenue_code: 6314,
    revenue: "Special Purpose - ESSER III - Supplemental - Learning Loss",
    category_code: 6000,
  },
  {
    serialization_code: 131,
    revenue_code: 6318,
    revenue: "Special Purpose - Reserve G",
    category_code: 6000,
  },
  {
    serialization_code: 132,
    revenue_code: 6319,
    revenue: "Special Purpose - Reserve H",
    category_code: 6000,
  },
  {
    serialization_code: 133,
    revenue_code: 6321,
    revenue: "Special Education - Medicaid Reimbursements",
    category_code: 6000,
  },
  {
    serialization_code: 134,
    revenue_code: 6322,
    revenue:
      "Special Education - Infants and Toddlers - Medicaid Reimbursements",
    category_code: 6000,
  },
  {
    serialization_code: 135,
    revenue_code: 6324,
    revenue: "Special Education - Supplemental",
    category_code: 6000,
  },
  {
    serialization_code: 136,
    revenue_code: 6325,
    revenue: "Special Education - Infants and Toddlers - Federal",
    category_code: 6000,
  },
  {
    serialization_code: 137,
    revenue_code: 6338,
    revenue: "Secondary Vocational Education",
    category_code: 6000,
  },
  {
    serialization_code: 138,
    revenue_code: 6346,
    revenue: "Skill Center",
    category_code: 6000,
  },
  {
    serialization_code: 139,
    revenue_code: 6351,
    revenue: "ESEA Disadvantaged - Federal",
    category_code: 6000,
  },
  {
    serialization_code: 140,
    revenue_code: 6352,
    revenue: "Other Title Grants Under ESEA - Federal",
    category_code: 6000,
  },
  {
    serialization_code: 141,
    revenue_code: 6353,
    revenue: "ESEA Migrant - Federal",
    category_code: 6000,
  },
  {
    serialization_code: 142,
    revenue_code: 6354,
    revenue: "Reading First",
    category_code: 6000,
  },
  {
    serialization_code: 143,
    revenue_code: 6361,
    revenue: "Head Start",
    category_code: 6000,
  },
  {
    serialization_code: 144,
    revenue_code: 6362,
    revenue: "Math and Science - Professional Development",
    category_code: 6000,
  },
  {
    serialization_code: 145,
    revenue_code: 6364,
    revenue: "Limited English Proficiency",
    category_code: 6000,
  },
  {
    serialization_code: 146,
    revenue_code: 6367,
    revenue: "Indian Education - JOM",
    category_code: 6000,
  },
  {
    serialization_code: 147,
    revenue_code: 6368,
    revenue: "Indian Education - ED",
    category_code: 6000,
  },
  {
    serialization_code: 148,
    revenue_code: 6376,
    revenue: "Targeted Assistance",
    category_code: 6000,
  },
  {
    serialization_code: 149,
    revenue_code: 6378,
    revenue: "Youth Training Programs",
    category_code: 6000,
  },
  {
    serialization_code: 150,
    revenue_code: 6388,
    revenue: "Child Care",
    category_code: 6000,
  },
  {
    serialization_code: 151,
    revenue_code: 6389,
    revenue: "Other Community Services",
    category_code: 6000,
  },
  {
    serialization_code: 152,
    revenue_code: 6398,
    revenue: "School Food Services",
    category_code: 6000,
  },
  {
    serialization_code: 153,
    revenue_code: 6399,
    revenue: "Transportation - Operations",
    category_code: 6000,
  },
  {
    serialization_code: 154,
    revenue_code: 6998,
    revenue: "USDA Commodities",
    category_code: 6000,
  },
  {
    serialization_code: 155,
    revenue_code: 7100,
    revenue: "Program Participation - Unassigned",
    category_code: 7000,
  },
  {
    serialization_code: 156,
    revenue_code: 7121,
    revenue: "Special Education",
    category_code: 7000,
  },
  {
    serialization_code: 157,
    revenue_code: 7122,
    revenue: "Special Education - Infants and Toddlers",
    category_code: 7000,
  },
  {
    serialization_code: 158,
    revenue_code: 7131,
    revenue: "Vocational Education",
    category_code: 7000,
  },
  {
    serialization_code: 159,
    revenue_code: 7145,
    revenue: "Skill Center",
    category_code: 7000,
  },
  {
    serialization_code: 160,
    revenue_code: 7147,
    revenue: "Skill Center - Facility Upgrades",
    category_code: 7000,
  },
  {
    serialization_code: 161,
    revenue_code: 7189,
    revenue: "Other Community Services",
    category_code: 7000,
  },
  {
    serialization_code: 162,
    revenue_code: 7197,
    revenue: "Support Services",
    category_code: 7000,
  },
  {
    serialization_code: 163,
    revenue_code: 7198,
    revenue: "School Food Services",
    category_code: 7000,
  },
  {
    serialization_code: 164,
    revenue_code: 7199,
    revenue: "Transportation",
    category_code: 7000,
  },
  {
    serialization_code: 165,
    revenue_code: 7301,
    revenue: "Nonhigh Participation",
    category_code: 7000,
  },
  {
    serialization_code: 166,
    revenue_code: 8100,
    revenue: "Governmental Entities",
    category_code: 8000,
  },
  {
    serialization_code: 167,
    revenue_code: 8101,
    revenue: "Governmental Entities - Enrichment",
    category_code: 8000,
  },
  {
    serialization_code: 168,
    revenue_code: 8188,
    revenue: "Child Care",
    category_code: 8000,
  },
  {
    serialization_code: 169,
    revenue_code: 8189,
    revenue: "Community Services",
    category_code: 8000,
  },
  {
    serialization_code: 170,
    revenue_code: 8198,
    revenue: "School Food Services",
    category_code: 8000,
  },
  {
    serialization_code: 171,
    revenue_code: 8199,
    revenue: "Transportation",
    category_code: 8000,
  },
  {
    serialization_code: 172,
    revenue_code: 8200,
    revenue: "Private Foundations",
    category_code: 8000,
  },
  {
    serialization_code: 173,
    revenue_code: 8500,
    revenue: "Educational Service Districts",
    category_code: 8000,
  },
  {
    serialization_code: 174,
    revenue_code: 8521,
    revenue: "Educational Service Districts - Special Education",
    category_code: 8000,
  },
  {
    serialization_code: 175,
    revenue_code: 8522,
    revenue:
      "Educational Service Districts - Special Education - Infants and Toddlers",
    category_code: 8000,
  },
  {
    serialization_code: 176,
    revenue_code: 9100,
    revenue: "Sale of Bonds",
    category_code: 9000,
  },
  {
    serialization_code: 177,
    revenue_code: 9200,
    revenue: "Sale of Real Property",
    category_code: 9000,
  },
  {
    serialization_code: 178,
    revenue_code: 9300,
    revenue: "Sale of Equipment",
    category_code: 9000,
  },
  {
    serialization_code: 179,
    revenue_code: 9400,
    revenue: "Compensated Loss of Capital Assets",
    category_code: 9000,
  },
  {
    serialization_code: 180,
    revenue_code: 9500,
    revenue: "Long-Term Financing",
    category_code: 9000,
  },
  {
    serialization_code: 181,
    revenue_code: 9900,
    revenue: "Transfers - Redirection of Apportionment",
    category_code: 9000,
  },
  {
    serialization_code: 182,
    revenue_code: 9901,
    revenue: "Transfers - Other Resources",
    category_code: 9000,
  },
];
