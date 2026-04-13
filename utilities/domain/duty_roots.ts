export type DutyRootInfo = {
  duty_root: string;
  duty_category: string;
  duty_code: number;
};

const ALL_DUTY_ROOTS : Array<DutyRootInfo> = [
  {
    duty_code: 11,
    duty_category: 'administrator',
    duty_root: "Superintendent",
  },
  {
    duty_code: 12,
    duty_category: 'administrator',
    duty_root: "Deputy/Assistant Superintendent",
  },
  {
    duty_code: 13,
    duty_category: 'administrator',
    duty_root: "Other District Administrator",
  },
  {
    duty_code: 21,
    duty_category: 'principal',
    duty_root: "Elementary Principal",
  },
  {
    duty_code: 22,
    duty_category: 'principal',
    duty_root: "Elementary Vice Principal",
  },
  {
    duty_code: 23,
    duty_category: 'principal',
    duty_root: "Secondary Principal",
  },
  {
    duty_code: 24,
    duty_category: 'principal',
    duty_root: "Secondary Vice Principal",
  },
  {
    duty_code: 25,
    duty_category: 'administrator',
    duty_root: "Other School Administrator",
  },
  {
    duty_code: 31,
    duty_category: 'teacher',
    duty_root: "Elementary Homeroom Teacher",
  },
  {
    duty_code: 32,
    duty_category: 'teacher',
    duty_root: "Secondary Teacher",
  },
  {
    duty_code: 33,
    duty_category: 'teacher',
    duty_root: "Other Teacher",
  },
  {
    duty_code: 34,
    duty_category: 'teacher',
    duty_root: "Elementary Specialist Teacher",
  },
  {
    duty_code: 39,
    duty_category: 'health',
    duty_root: "Orientation and Mobility Specialist",
  },
  {
    duty_code: 40,
    duty_category: 'support',
    duty_root: "Other Support Personnel",
  },
  {
    duty_code: 41,
    duty_category: 'support',
    duty_root: "Library Media Specialist",
  },
  {
    duty_code: 42,
    duty_category: 'mental health',
    duty_root: "Counselor",
  },
  {
    duty_code: 43,
    duty_category: 'health',
    duty_root: "Occupational Therapist",
  },
  {
    duty_code: 44,
    duty_category: 'mental health',
    duty_root: "Social Worker",
  },
  {
    duty_code: 45,
    duty_category: 'health',
    duty_root: "Speech-Language Pathologist or Audiologist",
  },
  {
    duty_code: 46,
    duty_category: 'health',
    duty_root: "Psychologist",
  },
  {
    duty_code: 47,
    duty_category: 'health',
    duty_root: "Nurse",
  },
  {
    duty_code: 48,
    duty_category: 'health',
    duty_root: "Physical Therapist",
  },
  {
    duty_code: 49,
    duty_category: 'mental health',
    duty_root: "Behavior Analyst",
  },
  {
    duty_code: 51,
    duty_category: 'extracurricular',
    duty_root: "Extracurricular (Base Contract)",
  },
  {
    duty_code: 52,
    duty_category: 'teacher',
    duty_root: "Substitute Teacher",
  },
  {
    duty_code: 61,
    duty_category: 'teacher',
    duty_root: "Certificated on Leave or Buy Back",
  },
  {
    duty_code: 63,
    duty_category: 'teacher',
    duty_root: "Contractor Teacher",
  },
  {
    duty_code: 64,
    duty_category: 'teacher',
    duty_root: "Contractor Educational Staff Associate",
  },
  {
    duty_code: 90,
    duty_category: 'teacher',
    duty_root: "Classified on Leave or Buy Back",
  },
  {
    duty_code: 91,
    duty_category: 'teacher',
    duty_root: "Aide",
  },
  {
    duty_code: 92,
    duty_category: 'maintenance or custodial',
    duty_root: "Crafts or Trades",
  },
  {
    duty_code: 93,
    duty_category: 'maintenance or custodial',
    duty_root: "Laborer",
  },
  {
    duty_code: 94,
    duty_category: 'administrator',
    duty_root: "Office or Clerical",
  },
  {
    duty_code: 95,
    duty_category: 'maintenance or custodial',
    duty_root: "Operator",
  },
  {
    duty_code: 96,
    duty_category: 'professional',
    duty_root: "Professional",
  },
  {
    duty_code: 97,
    duty_category: 'maintenance or custodial',
    duty_root: "Service Worker",
  },
  {
    duty_code: 98,
    duty_category: 'technical',
    duty_root: "Technical",
  },
  {
    duty_code: 99,
    duty_category: 'administrator',
    duty_root: "Director or Supervisor",
  }
];

export default ALL_DUTY_ROOTS;
