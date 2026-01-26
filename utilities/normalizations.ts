export const ALL_CURRENCY_NORMALIZATION = [
  "amount", // Raw amount. No normalization
  "pctexp", // Percent of total expenditures.
  "pctcomp", // Percent total expenditures on compensation.
];
export type CurrencyNormalization = (typeof ALL_CURRENCY_NORMALIZATION)[number];
export function serializeCurrencyNormalization(
  normalization: CurrencyNormalization,
) {
  return normalization as string;
}
export function deserializeCurrencyNormalization(
  s: string,
): CurrencyNormalization {
  if (ALL_CURRENCY_NORMALIZATION.includes(s)) {
    return s as CurrencyNormalization;
  }

  return "amount" as const;
}

export const ALL_STAFFING_NORMALIZATION = [
  "fte", // Raw amount. No normalization.
  "pctfte", // Percent of total staffing.
];
export function serializeStaffingNormalization(
  normalization: StaffingNormalization,
) {
  return normalization as string;
}
export function deserializeStaffingNormalization(
  s: string,
): StaffingNormalization {
  if (ALL_STAFFING_NORMALIZATION.includes(s)) {
    return s as StaffingNormalization;
  }

  return "fte" as const;
}

export type StaffingNormalization = (typeof ALL_STAFFING_NORMALIZATION)[number];


