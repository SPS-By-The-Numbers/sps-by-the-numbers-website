export type NcesInfo = {
  serialization_code: number;
  nces_code: number;
  nces: string;
  nces_category: string;
};

const ALL_NCES : Array<NcesInfo> = [
  {
    serialization_code: 1,
    nces_code: 110,
    nces: 'Salaries of Regular Employee',
    nces_category: 'Salaries'
  },
  {
    serialization_code: 2,
    nces_code: 112,
    nces: '[incorrect?] Group Insurance - Certificated',
    nces_category: 'Salaries'
  },
  {
    serialization_code: 3,
    nces_code: 113,
    nces: '[incorrect?] Group Insurance - Classified',
    nces_category: 'Salaries'
  },
  {
    serialization_code: 4,
    nces_code: 120,
    nces: 'Salaries of Temporary EEs & Subs',
    nces_category: 'Salaries'
  },
  {
    serialization_code: 5,
    nces_code: 130,
    nces: 'Non contracted Salaries / Extra Time',
    nces_category: 'Salaries'
  },
  {
    serialization_code: 6,
    nces_code: 140,
    nces: 'Sabbatical Leave',
    nces_category: 'Salaries'
  },
  {
    serialization_code: 7,
    nces_code: 150,
    nces: 'Supplemental Contracts',
    nces_category: 'Salaries'
  },
  {
    serialization_code: 8,
    nces_code: 160,
    nces: 'Other Salaries',
    nces_category: 'Salaries'
  },
  {
    serialization_code: 9,
    nces_code: 170,
    nces: 'National Board Certificated Teacher',
    nces_category: 'Salaries'
  },
  {
    serialization_code: 10,
    nces_code: 212,
    nces: 'Group Insurance-Certificate',
    nces_category: 'Benefits'
  },
  {
    serialization_code: 11,
    nces_code: 213,
    nces: 'Group Insurance-Classified',
    nces_category: 'Benefits'
  },
  {
    serialization_code: 12,
    nces_code: 222,
    nces: 'Federally Mandated Insurance-Certificate',
    nces_category: 'Benefits'
  },
  {
    serialization_code: 13,
    nces_code: 223,
    nces: 'Federally Mandated Insurance-Classified',
    nces_category: 'Benefits'
  },
  {
    serialization_code: 14,
    nces_code: 232,
    nces: 'Retirement Contribution - Certificated',
    nces_category: 'Benefits'
  },
  {
    serialization_code: 15,
    nces_code: 233,
    nces: 'Retirement Contribution - Classified',
    nces_category: 'Benefits'
  },
  {
    serialization_code: 16,
    nces_code: 242,
    nces: 'On-Behalf Payments - Certificated',
    nces_category: 'Benefits'
  },
  {
    serialization_code: 17,
    nces_code: 243,
    nces: 'On-Behalf Payments - Classified',
    nces_category: 'Benefits'
  },
  {
    serialization_code: 18,
    nces_code: 252,
    nces: 'Tuition Reimbursement - Certificated',
    nces_category: 'Benefits'
  },
  {
    serialization_code: 19,
    nces_code: 253,
    nces: 'Tuition Reimbursement - Classified',
    nces_category: 'Benefits'
  },
  {
    serialization_code: 20,
    nces_code: 262,
    nces: 'Unemployment Compensation - Certificated',
    nces_category: 'Benefits'
  },
  {
    serialization_code: 21,
    nces_code: 263,
    nces: 'Unemployment Compensation - Classified',
    nces_category: 'Benefits'
  },
  {
    serialization_code: 22,
    nces_code: 272,
    nces: "Worker's Compensation - Certificated",
    nces_category: 'Benefits'
  },
  {
    serialization_code: 23,
    nces_code: 273,
    nces: "Worker's Compensation - Classified",
    nces_category: 'Benefits'
  },
  {
    serialization_code: 24,
    nces_code: 282,
    nces: 'Health Benefits - Certificated',
    nces_category: 'Benefits'
  },
  {
    serialization_code: 25,
    nces_code: 283,
    nces: 'Health Benefits - Classified',
    nces_category: 'Benefits'
  },
  {
    serialization_code: 26,
    nces_code: 292,
    nces: 'Other Employee Benefits - Certificated',
    nces_category: 'Benefits'
  },
  {
    serialization_code: 27,
    nces_code: 293,
    nces: 'Other Employee Benefits  - Classified',
    nces_category: 'Benefits'
  },
  {
    serialization_code: 28,
    nces_code: 310,
    nces: 'Office and Administrative Services',
    nces_category: 'Purchased Services - Professional/Technical'
  },
  {
    serialization_code: 29,
    nces_code: 311,
    nces: 'Election Fees',
    nces_category: 'Purchased Services - Professional/Technical'
  },
  {
    serialization_code: 30,
    nces_code: 320,
    nces: 'Professional Educational Services',
    nces_category: 'Purchased Services - Professional/Technical'
  },
  {
    serialization_code: 31,
    nces_code: 321,
    nces: 'Contracted Teachers',
    nces_category: 'Purchased Services - Professional/Technical'
  },
  {
    serialization_code: 32,
    nces_code: 322,
    nces: 'Contracted Educational Staff Associates',
    nces_category: 'Purchased Services - Professional/Technical'
  },
  {
    serialization_code: 33,
    nces_code: 330,
    nces: 'Employee Training and Development Services',
    nces_category: 'Purchased Services - Professional/Technical'
  },
  {
    serialization_code: 34,
    nces_code: 340,
    nces: 'Other Professional Purchased Services',
    nces_category: 'Purchased Services - Professional/Technical'
  },
  {
    serialization_code: 35,
    nces_code: 341,
    nces: 'Legal Services for District support',
    nces_category: 'Purchased Services - Professional/Technical'
  },
  {
    serialization_code: 36,
    nces_code: 342,
    nces: 'Audit Services',
    nces_category: 'Purchased Services - Professional/Technical'
  },
  {
    serialization_code: 37,
    nces_code: 343,
    nces: 'Other Legal Services',
    nces_category: 'Purchased Services - Professional/Technical'
  },
  {
    serialization_code: 38,
    nces_code: 350,
    nces: 'Technical Services',
    nces_category: 'Purchased Services - Professional/Technical'
  },
  {
    serialization_code: 39,
    nces_code: 351,
    nces: 'Data Processing and Coding Services',
    nces_category: 'Purchased Services - Professional/Technical'
  },
  {
    serialization_code: 40,
    nces_code: 352,
    nces: 'Other Technical Services',
    nces_category: 'Purchased Services - Professional/Technical'
  },
  {
    serialization_code: 41,
    nces_code: 410,
    nces: 'Utility Services',
    nces_category: 'Purchased Property Services'
  },
  {
    serialization_code: 42,
    nces_code: 420,
    nces: 'Cleaning Services',
    nces_category: 'Purchased Property Services'
  },
  {
    serialization_code: 43,
    nces_code: 431,
    nces: 'Non-Technology-Related Repair and Maintenance',
    nces_category: 'Purchased Property Services'
  },
  {
    serialization_code: 44,
    nces_code: 432,
    nces: 'Technology-Related Repair and Maintenance',
    nces_category: 'Purchased Property Services'
  },
  {
    serialization_code: 45,
    nces_code: 441,
    nces: 'Rentals of Land and Buildings',
    nces_category: 'Purchased Property Services'
  },
  {
    serialization_code: 46,
    nces_code: 442,
    nces: 'Rentals of Equipment and Vehicles',
    nces_category: 'Purchased Property Services'
  },
  {
    serialization_code: 47,
    nces_code: 443,
    nces: 'Rentals of Computers and Related Equipment',
    nces_category: 'Purchased Property Services'
  },
  {
    serialization_code: 48,
    nces_code: 450,
    nces: 'Contractor Services (renovating, remodeling)',
    nces_category: 'Purchased Property Services'
  },
  {
    serialization_code: 49,
    nces_code: 490,
    nces: 'Other Purchased Property Services',
    nces_category: 'Purchased Property Services'
  },
  {
    serialization_code: 50,
    nces_code: 511,
    nces: 'Student Transportation Purchased from Another District',
    nces_category: 'Other Purchased Services'
  },
  {
    serialization_code: 51,
    nces_code: 512,
    nces: 'Student Transportation Purchased From an LEA or SEA Out-of-State',
    nces_category: 'Other Purchased Services'
  },
  {
    serialization_code: 52,
    nces_code: 519,
    nces: 'Student Transportation Svcs purchased from another',
    nces_category: 'Other Purchased Services'
  },
  {
    serialization_code: 53,
    nces_code: 520,
    nces: 'Insurance (Other Than Employee Benefits) (Property',
    nces_category: 'Other Purchased Services'
  },
  {
    serialization_code: 54,
    nces_code: 530,
    nces: 'Communications',
    nces_category: 'Other Purchased Services'
  },
  {
    serialization_code: 55,
    nces_code: 540,
    nces: 'Advertising',
    nces_category: 'Other Purchased Services'
  },
  {
    serialization_code: 56,
    nces_code: 550,
    nces: 'Printing and Binding',
    nces_category: 'Other Purchased Services'
  },
  {
    serialization_code: 57,
    nces_code: 565,
    nces: 'Tuition Paid to Postsecondary Schools (Dual Credit',
    nces_category: 'Other Purchased Services'
  },
  {
    serialization_code: 58,
    nces_code: 569,
    nces: 'Tuition - Other',
    nces_category: 'Other Purchased Services'
  },
  {
    serialization_code: 59,
    nces_code: 570,
    nces: 'Food Service Management',
    nces_category: 'Other Purchased Services'
  },
  {
    serialization_code: 60,
    nces_code: 580,
    nces: 'Travel',
    nces_category: 'Other Purchased Services'
  },
  {
    serialization_code: 61,
    nces_code: 591,
    nces: 'Services From Another District or ESD',
    nces_category: 'Other Purchased Services'
  },
  {
    serialization_code: 62,
    nces_code: 592,
    nces: 'Services Purchased Fron Another LEA or SEA Out-of-State',
    nces_category: 'Other Purchased Services'
  },
  {
    serialization_code: 63,
    nces_code: 610,
    nces: 'General Supplies',
    nces_category: 'Supplies'
  },
  {
    serialization_code: 64,
    nces_code: 621,
    nces: 'Natural Gas',
    nces_category: 'Supplies'
  },
  {
    serialization_code: 65,
    nces_code: 622,
    nces: 'Electricity',
    nces_category: 'Supplies'
  },
  {
    serialization_code: 66,
    nces_code: 623,
    nces: 'Energy - Bottled Gas',
    nces_category: 'Supplies'
  },
  {
    serialization_code: 67,
    nces_code: 624,
    nces: 'Oil',
    nces_category: 'Supplies'
  },
  {
    serialization_code: 68,
    nces_code: 625,
    nces: 'Coal',
    nces_category: 'Supplies'
  },
  {
    serialization_code: 69,
    nces_code: 626,
    nces: 'Motor Vehicle Fuel',
    nces_category: 'Supplies'
  },
  {
    serialization_code: 70,
    nces_code: 629,
    nces: 'Other Energy',
    nces_category: 'Supplies'
  },
  {
    serialization_code: 71,
    nces_code: 630,
    nces: 'Food',
    nces_category: 'Supplies'
  },
  {
    serialization_code: 72,
    nces_code: 640,
    nces: 'Books and Periodicals',
    nces_category: 'Supplies'
  },
  {
    serialization_code: 73,
    nces_code: 650,
    nces: 'Supplies - Technology Related',
    nces_category: 'Supplies'
  },
  {
    serialization_code: 74,
    nces_code: 710,
    nces: 'Land and Improvements',
    nces_category: 'Property/Equipment'
  },
  {
    serialization_code: 75,
    nces_code: 720,
    nces: 'Buildings',
    nces_category: 'Property/Equipment'
  },
  {
    serialization_code: 76,
    nces_code: 731,
    nces: 'Machinery',
    nces_category: 'Property/Equipment'
  },
  {
    serialization_code: 77,
    nces_code: 732,
    nces: 'Vehicles',
    nces_category: 'Property/Equipment'
  },
  {
    serialization_code: 78,
    nces_code: 733,
    nces: 'Furniture and Fixtures',
    nces_category: 'Property/Equipment'
  },
  {
    serialization_code: 79,
    nces_code: 734,
    nces: 'Technology-Related Hardware',
    nces_category: 'Property/Equipment'
  },
  {
    serialization_code: 80,
    nces_code: 735,
    nces: 'Technology-Related Software',
    nces_category: 'Property/Equipment'
  },
  {
    serialization_code: 81,
    nces_code: 739,
    nces: 'Other Equipment',
    nces_category: 'Property/Equipment'
  },
  {
    serialization_code: 82,
    nces_code: 810,
    nces: 'Dues and Fees',
    nces_category: 'Debt Service/Misc'
  },
  {
    serialization_code: 83,
    nces_code: 820,
    nces: 'Settlements and Judgements Against the School Dist',
    nces_category: 'Debt Service/Misc'
  },
  {
    serialization_code: 84,
    nces_code: 831,
    nces: 'Redemption of Principal',
    nces_category: 'Debt Service/Misc'
  },
  {
    serialization_code: 85,
    nces_code: 832,
    nces: 'Interest on Long-Term Debt',
    nces_category: 'Debt Service/Misc'
  },
  {
    serialization_code: 86,
    nces_code: 833,
    nces: 'Debt - Bond Issuance and Other Debt-Related Costs',
    nces_category: 'Debt Service/Misc'
  },
  {
    serialization_code: 87,
    nces_code: 835,
    nces: 'Interest on Short-Term Debt',
    nces_category: 'Debt Service/Misc'
  },
  {
    serialization_code: 88,
    nces_code: 950,
    nces: 'Special Items',
    nces_category: 'Other items'
  },
  {
    serialization_code: 89,
    nces_code: 960,
    nces: 'Extraordinary Items',
    nces_category: 'Other items'
  },
  {
    serialization_code: 90,
    nces_code: 0,
    nces: 'Debit/Credit Transfers',
    nces_category: 'Transfers'
  }
];

export default ALL_NCES;
