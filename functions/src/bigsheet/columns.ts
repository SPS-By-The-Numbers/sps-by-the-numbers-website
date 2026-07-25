// The single source of truth for bigsheet's non-pivot output columns: final
// name, where the value comes from, and the dictionary text. assemble.ts
// renders these into SQL; dictionary.ts renders them into the data
// dictionary; the arrays' order IS the output column order within each block.
//
// Naming rules (see NAMING.md): snake_case [a-z][a-z0-9_]*, one family prefix
// per data source. Sources refresh on independent cadences, so the prefix
// tells consumers which columns update together:
//   (identity)  OSPI report card + SPS domain table (d_school)
//   enroll_     OSPI report card enrollment (ospi.rc_enrollment)
//   spend_      SAFS F-196 general-fund expenditures (safs_f19x)
//   staff_      SAFS S-275 personnel reports (safs_s275)
//   churn_      staff building transitions (data-tools S-275 derivative CSV)
//   map_hc_ / map_nonhc_  SPS MAP score extracts (static CSVs)
//   bex_        SPS BEX-VI historic building scores (static CSV)
//   bldg_       SPS utilization / condition (static CSV)
//   income_     area income by school zone (static CSV)
//   asmt_       OSPI report card assessments (ospi.rc_assessment)
//   sqss_       OSPI SQSS measures (static CSV)

export type SourceKey =
  | 'identity' | 'enroll' | 'spend' | 'staff' | 'churn'
  | 'map_hc' | 'map_nonhc' | 'bex' | 'bldg' | 'income' | 'asmt' | 'sqss';

export const SOURCE_LABELS: Record<SourceKey, string> = {
  identity: 'School identity (OSPI report card; SPS domain table d_school)',
  enroll: 'OSPI report card enrollment (ospi.rc_enrollment, All Grades rows)',
  spend: 'SAFS F-196 general-fund expenditures (safs_f19x, actuals, school-attributed only)',
  staff: 'SAFS S-275 personnel reports (safs_s275)',
  churn: 'Staff building transitions (data-tools S-275 derivative, bigsheet_inputs.building_transitions)',
  map_hc: 'SPS MAP score extract, highly-capable cohort (bigsheet_inputs.map_hc)',
  map_nonhc: 'SPS MAP score extract, non-highly-capable cohort (bigsheet_inputs.map_nonhc)',
  bex: 'SPS BEX-VI historic building scores (bigsheet_inputs.bex)',
  bldg: 'SPS building utilization / condition (bigsheet_inputs.utilization_condition)',
  income: 'Area income by school zone (bigsheet_inputs.income_by_school)',
  asmt: 'OSPI report card assessments (ospi.rc_assessment, All Grades rows)',
  sqss: 'OSPI School Quality or Student Success measures (bigsheet_inputs.sqss)',
};

/**
 * A non-pivot output column. Exactly one of:
 *   from       — rename of a vitals_org column (applied in the vitals_named CTE)
 *   vitalsExpr — computed in vitals_named over vitals_org alias `vo`
 *   mergedExpr — computed in merged (after the assessment outer join)
 *   normExpr   — computed in merged_norm over merged alias `m`
 */
export interface ScalarColumn {
  name: string;
  source: SourceKey;
  doc: string;
  spsOnly?: boolean;
  from?: string;
  vitalsExpr?: string;
  mergedExpr?: string;
  normExpr?: string;
}

// ---- enrollment student groups (order = output order) -----------------------
const ENROLL_GROUPS: Array<[string, string]> = [
  ['military_parent', 'students with a parent in the military'],
  ['migrant', 'migrant students'],
  ['low_income', 'low-income students'],
  ['homeless', 'homeless students'],
  ['foster_care', 'students in foster care'],
  ['mobile', 'mobile students'],
  ['section_504', 'students with a Section 504 plan'],
  ['highly_capable', 'highly-capable students'],
  ['english_language_learners', 'English language learners'],
  ['students_with_disabilities', 'students with disabilities'],
  ['female', 'female students'],
  ['male', 'male students'],
  ['gender_x', 'gender X students'],
  ['white', 'White students'],
  ['black_african_american', 'Black / African American students'],
  ['native_hawaiian_other_pacific', 'Native Hawaiian / other Pacific Islander students'],
  ['hispanic_latino_of_any_race', 'Hispanic / Latino students of any race'],
  ['american_indian_alaskan_native', 'American Indian / Alaskan Native students'],
  ['asian', 'Asian students'],
  ['two_or_more_races', 'students of two or more races'],
];

// ---- F-196 program-spend categories (order = output order) ------------------
const SPEND_CATEGORIES: Array<[string, string]> = [
  ['gen_ed', 'general education (programs 1, 2, 3, 9, 75)'],
  ['spec_ed', 'special education (programs 21-26, 29)'],
  ['compensatory', 'compensatory education (programs 54, 56-59, 61, 62, 67-69)'],
  ['lap', 'Learning Assistance Program (program 55)'],
  ['title1', 'Title I (programs 51-53)'],
  ['ble', 'bilingual education (programs 64, 65)'],
  ['instr_other', 'other instructional (program 79)'],
  ['district_support', 'district-wide support (program 97)'],
  ['other', 'all other programs'],
  ['voc', 'vocational (programs 31, 34, 38, 39, 45, 46, 47); dropped by the ' +
   'original mart queries, deliberately restored here'],
];

// ---- S-275 staff roles ------------------------------------------------------
// [role slug, vitals_org prefix, duty roots, has fte column]
const STAFF_ROLES: Array<[string, string, string, boolean]> = [
  ['all', '', 'all duty roots', true],
  ['class_teacher', 'class_teacher_', 'duty roots 31-32', true],
  ['other_teacher', 'other_teacher_', 'duty roots 33-34 (other/support teachers; ' +
   'the 33/34 split changed definition in 2015-16 — treat the combined series with care)', true],
  ['aide', 'aide_', 'duty root 91', true],
  ['principal', 'principal_', 'duty roots 21, 23', false],
  ['asst_principal', 'asst_principal_', 'duty roots 22, 24', true],
  ['counselor', 'counselor_', 'duty roots 42, 44', true],
  ['librarian', 'librarian_', 'duty root 41', true],
];

function staffMoneyColumns(): ScalarColumn[] {
  const cols: ScalarColumn[] = [];
  for (const [slug, prefix, duties, hasFte] of STAFF_ROLES) {
    const role = slug === 'all' ? 'all staff' : slug.replace(/_/g, ' ');
    cols.push({
      name: `staff_${slug}_salary`, from: `${prefix}assignment_salary`, source: 'staff',
      doc: `Sum of assignment salary for ${role} (${duties}).`,
    });
    if (hasFte) {
      cols.push({
        name: `staff_${slug}_fte`, from: slug === 'all' ? 'fte' : `${prefix}fte`,
        source: 'staff',
        doc: `Sum of fte_in_assignment for ${role} (${duties}).`,
      });
    }
    cols.push({
      name: `staff_${slug}_est_compensation`,
      from: `${prefix}c_est_total_compensation`, source: 'staff',
      doc: `Estimated total compensation for ${role} (computed upstream from S-275).`,
    });
    cols.push({
      name: `staff_${slug}_est_final_salary`,
      from: `${prefix}c_est_total_final_salary`, source: 'staff',
      doc: `Estimated total final salary for ${role} (computed upstream from S-275).`,
    });
    if (slug === 'class_teacher' || slug === 'principal') {
      const nprefix = slug === 'class_teacher' ? 'num_class_teachers' : 'num_principal';
      cols.push(
        { name: `staff_${slug}_exp_p50`, from: `${prefix}exp_p50`, source: 'staff',
          doc: `Median (exact order statistic) years of experience among distinct ${role}s.` },
        { name: `staff_${slug}_exp_p80`, from: `${prefix}exp_p80`, source: 'staff',
          doc: `80th-percentile (exact order statistic) years of experience among distinct ${role}s.` },
        { name: `staff_${slug}_exp_avg`, from: `${prefix}exp_avg`, source: 'staff',
          doc: `Mean years of experience among distinct ${role}s.` },
        { name: `staff_${slug}_count`, from: nprefix, source: 'staff',
          doc: `Count of distinct ${role}s.` },
        { name: `staff_${slug}_count_bachelors`, from: `${nprefix}_bachelors`, source: 'staff',
          doc: `Distinct ${role}s whose highest degree is a bachelor's.` },
        { name: `staff_${slug}_count_masters`, from: `${nprefix}_masters`, source: 'staff',
          doc: `Distinct ${role}s whose highest degree is a master's.` },
        { name: `staff_${slug}_count_doctors`, from: `${nprefix}_doctors`, source: 'staff',
          doc: `Distinct ${role}s whose highest degree is a doctorate.` },
      );
    }
  }
  return cols;
}

function enrollColumns(): ScalarColumn[] {
  const cols: ScalarColumn[] = [{
    name: 'enroll_total', from: 'all_students', source: 'enroll',
    doc: 'Total enrolled students (All Grades row).',
  }];
  for (const [g, desc] of ENROLL_GROUPS) {
    cols.push({ name: `enroll_${g}`, from: g, source: 'enroll',
      doc: `Enrolled ${desc}.` });
  }
  for (const [g, desc] of ENROLL_GROUPS) {
    cols.push({ name: `enroll_pct_${g}`, from: `pct_${g}`, source: 'enroll',
      doc: `Share of enrolled students who are ${desc}.` });
  }
  cols.push(
    { name: 'enroll_log_total', source: 'enroll',
      mergedExpr: 'IF(vb.enroll_total > 0, LN(vb.enroll_total), NULL)',
      doc: 'Natural log of total enrollment (NULL when enrollment is 0).' },
    { name: 'enroll_total_normalized', source: 'enroll',
      normExpr: 'SAFE_DIVIDE(m.enroll_total, MAX(m.enroll_total) OVER ())',
      doc: 'Total enrollment scaled by the district-wide maximum (modeling feature).' },
  );
  return cols;
}

function spendColumns(): ScalarColumn[] {
  const excl = 'Excludes costs not attributed to a school (e.g. pupil transportation).';
  const cols: ScalarColumn[] = [
    { name: 'spend_total', from: 'total_spend', source: 'spend',
      doc: `Total general-fund spend, all program categories. ${excl}` },
    { name: 'spend_comp', from: 'comp_amount', source: 'spend',
      doc: `Compensation spend (objects 2-4), all program categories. ${excl}` },
    { name: 'spend_noncomp', from: 'non_comp_amount', source: 'spend',
      doc: `Non-compensation spend, all program categories. ${excl}` },
    { name: 'spend_per_pupil', from: 'spend_per_pupil', source: 'spend',
      doc: 'Total spend divided by total enrollment.' },
  ];
  for (const [cat, desc] of SPEND_CATEGORIES) {
    cols.push(
      { name: `spend_${cat}_total`, from: `total_spend_${cat}`, source: 'spend',
        doc: `Total spend: ${desc}.` },
      { name: `spend_${cat}_comp`, from: `comp_amount_${cat}`, source: 'spend',
        doc: `Compensation spend (objects 2-4): ${desc}.` },
      { name: `spend_${cat}_noncomp`, from: `non_comp_amount_${cat}`, source: 'spend',
        doc: `Non-compensation spend: ${desc}.` },
      { name: `spend_${cat}_per_pupil`, from: `spend_${cat}_per_pupil`, source: 'spend',
        doc: `Per-pupil spend: ${desc}.` },
    );
  }
  cols.push(
    { name: 'spend_grp_ex_ell_speced_comp_per_pupil', source: 'spend',
      vitalsExpr: 'COALESCE(vo.spend_gen_ed_per_pupil, 0) + COALESCE(vo.spend_instr_other_per_pupil, 0)' +
        ' + COALESCE(vo.spend_district_support_per_pupil, 0) + COALESCE(vo.spend_other_per_pupil, 0)',
      doc: 'Per-pupil spend group: everything except ELL, special ed and compensatory ' +
        '(gen_ed + instr_other + district_support + other; missing categories count as 0).' },
    { name: 'spend_grp_spec_ed_per_pupil', source: 'spend',
      vitalsExpr: 'COALESCE(vo.spend_spec_ed_per_pupil, 0) + COALESCE(vo.spend_compensatory_per_pupil, 0)',
      doc: 'Per-pupil spend group: special ed + compensatory (missing categories count as 0).' },
    { name: 'spend_grp_title1_lap_ble_per_pupil', source: 'spend',
      vitalsExpr: 'COALESCE(vo.spend_title1_per_pupil, 0) + COALESCE(vo.spend_lap_per_pupil, 0)' +
        ' + COALESCE(vo.spend_ble_per_pupil, 0)',
      doc: 'Per-pupil spend group: Title I + LAP + bilingual (missing categories count as 0).' },
  );
  return cols;
}

function staffColumns(): ScalarColumn[] {
  const cols: ScalarColumn[] = staffMoneyColumns();
  cols.push(
    { name: 'staff_all_fte_per_pupil', from: 'fte_per_pupil', source: 'staff',
      doc: 'Total staff FTE divided by total enrollment.' },
    { name: 'staff_class_teacher_fte_per_pupil', source: 'staff',
      normExpr: 'SAFE_DIVIDE(m.staff_class_teacher_fte, m.enroll_total)',
      doc: 'Classroom-teacher FTE per enrolled student (NULL when enrollment is 0).' },
    { name: 'staff_other_teacher_fte_per_pupil', source: 'staff',
      normExpr: 'SAFE_DIVIDE(m.staff_other_teacher_fte, m.enroll_total)',
      doc: 'Other-teacher FTE per enrolled student (NULL when enrollment is 0).' },
    { name: 'staff_asst_principal_fte_per_pupil', source: 'staff',
      normExpr: 'SAFE_DIVIDE(m.staff_asst_principal_fte, m.enroll_total)',
      doc: 'Assistant-principal FTE per enrolled student (NULL when enrollment is 0).' },
    { name: 'staff_class_teacher_pct_ge_bachelors', source: 'staff',
      normExpr: 'SAFE_DIVIDE(m.staff_class_teacher_count_bachelors + ' +
        'm.staff_class_teacher_count_masters + m.staff_class_teacher_count_doctors, ' +
        'm.staff_class_teacher_count)',
      doc: "Share of classroom teachers holding a bachelor's degree or higher." },
    { name: 'staff_class_teacher_pct_gt_bachelors', source: 'staff',
      normExpr: 'SAFE_DIVIDE(m.staff_class_teacher_count_masters + ' +
        'm.staff_class_teacher_count_doctors, m.staff_class_teacher_count)',
      doc: "Share of classroom teachers holding more than a bachelor's degree." },
    { name: 'staff_class_teacher_exp_p50_normalized', source: 'staff',
      normExpr: 'SAFE_DIVIDE(m.staff_class_teacher_exp_p50, ' +
        'MAX(m.staff_class_teacher_exp_p50) OVER ())',
      doc: 'Median classroom-teacher experience scaled by the district-wide maximum ' +
        '(modeling feature).' },
  );
  return cols;
}

function identityColumns(): ScalarColumn[] {
  const cols: ScalarColumn[] = [
    // class_of / school_code render specially in the final SELECT (COALESCE
    // across the outer joins); they are listed here for order + dictionary.
    { name: 'class_of', from: 'class_of', source: 'identity',
      doc: 'Graduating-cohort year labeling the school year (school year ending in this year).' },
    { name: 'school_code', from: 'school_code', source: 'identity',
      doc: 'OSPI school code; NULL on district-total rows.' },
    { name: 'school_name', from: 'school_name', source: 'identity',
      doc: 'School name from the OSPI report card enrollment file.' },
    { name: 'school_year', from: 'school_year', source: 'identity',
      doc: 'School year label (e.g. "2014-15").' },
    { name: 'type', from: 'type', source: 'identity',
      doc: 'School type (Elementary, Middle, K-8, Highschool, Other).' },
    { name: 'is_regular', from: 'is_regular', source: 'identity',
      doc: 'Whether this is a regular (non-alternative, non-service) school.' },
    { name: 'region', from: 'region', source: 'identity',
      doc: 'District-defined region (SPS: NW, NE, Central, SW, SE); NULL where not mapped.' },
    { name: 'ms_assignment_code', from: 'ms_assignment_code', source: 'identity',
      doc: 'School code of the middle school this school feeds (SPS assignment plan).' },
    { name: 'ms_assignment', from: 'ms_assignment', source: 'identity',
      doc: 'Name of the middle school this school feeds (SPS assignment plan).' },
    { name: 'at_or_after_2021', source: 'identity',
      mergedExpr: 'IF(COALESCE(vb.class_of, a.class_of) >= 2021, 1, 0)',
      doc: 'Indicator: class_of >= 2021 (post-COVID-onset school years).' },
    { name: 'class_of_normalized', source: 'identity',
      normExpr: 'SAFE_DIVIDE(m.class_of, MAX(m.class_of) OVER ())',
      doc: 'class_of scaled by its maximum (modeling feature).' },
    { name: 'school_code_normalized', source: 'identity',
      normExpr: 'SAFE_DIVIDE(m.school_code, MAX(m.school_code) OVER ())',
      doc: 'school_code scaled by its maximum (modeling feature; the code is an ' +
        'arbitrary identifier — use with care).' },
    { name: 'ms_assignment_code_normalized', source: 'identity', spsOnly: true,
      normExpr: 'SAFE_DIVIDE(m.ms_assignment_code, MAX(m.ms_assignment_code) OVER ())',
      doc: 'ms_assignment_code scaled by its maximum (modeling feature; arbitrary identifier).' },
  ];
  for (const [name, value] of [
    ['type_elementary', 'Elementary'], ['type_middle', 'Middle'],
    ['type_k8', 'K-8'], ['type_highschool', 'Highschool'],
    ['type_other', 'Other']] as Array<[string, string]>) {
    cols.push({ name, source: 'identity',
      vitalsExpr: `IF(vo.type = '${value}', 1, 0)`,
      doc: `Indicator: school type = ${value}.` });
  }
  for (const [name, value] of [
    ['region_nw', 'NW'], ['region_ne', 'NE'], ['region_central', 'Central'],
    ['region_sw', 'SW'], ['region_se', 'SE'], ['region_other', 'Other'],
    ['region_invalid', 'Invalid']] as Array<[string, string]>) {
    cols.push({ name, source: 'identity', spsOnly: true,
      vitalsExpr: `IF(vo.region = '${value}', 1, 0)`,
      doc: `Indicator: SPS region = ${value}.` });
  }
  for (const [name, code, school] of [
    ['ms_aki_kurose', 3774, 'Aki Kurose'], ['ms_denny', 2839, 'Denny'],
    ['ms_eckstein', 2729, 'Eckstein'], ['ms_hamilton', 2371, 'Hamilton'],
    ['ms_jane_addams', 5351, 'Jane Addams'], ['ms_madison', 2435, 'Madison'],
    ['ms_mcclure', 3517, 'McClure'], ['ms_meany', 5485, 'Meany'],
    ['ms_mercer', 3095, 'Mercer'], ['ms_resms', 5486, 'Robert Eagle Staff'],
    ['ms_washington', 4064, 'Washington'], ['ms_whitman', 3277, 'Whitman'],
  ] as Array<[string, number, string]>) {
    cols.push({ name, source: 'identity', spsOnly: true,
      vitalsExpr: `IF(vo.ms_assignment_code = ${code}, 1, 0)`,
      doc: `Indicator: feeds ${school} Middle School (ms_assignment_code = ${code}).` });
  }
  return cols;
}

/** All non-pivot, non-join columns in output order. */
export function scalarColumns(isSps: boolean): ScalarColumn[] {
  return [
    ...identityColumns(), ...enrollColumns(), ...spendColumns(), ...staffColumns(),
  ].filter((c) => isSps || !c.spsOnly);
}

// ---- Join-table renames (SPS-only static inputs) ----------------------------

export interface JoinColumn { name: string; from: string; doc: string; }

/** bigsheet_inputs.bex columns (mechanically sanitized CSV headers) -> clean
 * names. `from` must match the external-table schema created by data-tools
 * scripts/bigsheet_inputs_lib.py. */
export const BEX_COLUMNS: JoinColumn[] = [
  { name: 'bex_composite_score_2012', from: '_2012_Composite_Score',
    doc: 'Building composite score, 2012 assessment.' },
  { name: 'bex_composite_score_2015', from: '_2015_Composite_Score',
    doc: 'Building composite score, 2015 assessment.' },
  { name: 'bex_composite_score_2020', from: '_2020_Composite_Score_2021_FMPU_',
    doc: 'Building composite score, 2020 (2021 facilities master plan update).' },
  { name: 'bex_composite_score_2022', from: '_2022_Composite_2025_FMPU_',
    doc: 'Building composite score, 2022 (2025 facilities master plan update).' },
  { name: 'bex_composite_score_2024', from: '_2024_BEXVI_Composite_Score',
    doc: 'Building composite score, 2024 BEX VI assessment.' },
  { name: 'bex_bca_score_2018', from: '_2018_BCA_Score',
    doc: 'Building condition assessment score, 2018.' },
  { name: 'bex_bca_score_2022', from: '_2022_BCA_Score',
    doc: 'Building condition assessment score, 2022.' },
  { name: 'bex_lea_2022', from: '_2022_LEA',
    doc: 'LEA score, 2022 (as published in the BEX-VI scoring sheet).' },
  { name: 'bex_last_major_update', from: 'Last_Major_Update',
    doc: 'Year/description of the building\'s last major update (string).' },
  { name: 'bex_scope_of_work', from: 'Scope_of_Work',
    doc: 'Planned scope of work (string).' },
  { name: 'bex_condition_raw', from: 'Health_Safety_Security_Building_Condition_Raw_Score',
    doc: 'Health, safety, security & building condition — raw score.' },
  { name: 'bex_condition_scaled', from: 'Min_Max_Normalization_1_5_Scale_',
    doc: 'Health, safety, security & building condition — min-max normalized to a 1-5 scale.' },
  { name: 'bex_learning_env_raw', from: 'Learning_Environment_Raw_Score',
    doc: 'Learning environment — raw score.' },
  { name: 'bex_learning_env_scaled', from: 'Min_Max_Normalization_1_5_Scale_2',
    doc: 'Learning environment — min-max normalized to a 1-5 scale.' },
  { name: 'bex_accessibility_raw', from: 'Accessibility_Raw_Score',
    doc: 'Accessibility — raw score.' },
  { name: 'bex_accessibility_scaled', from: 'Min_Max_Normalization_1_5_Scale_3',
    doc: 'Accessibility — min-max normalized to a 1-5 scale.' },
  { name: 'bex_facilities_planning_raw', from: 'Facilities_Planning_2032_Enrollment_Forecasts_Capacity_',
    doc: 'Facilities planning (2032 enrollment forecasts vs capacity) — raw score.' },
  { name: 'bex_facilities_planning_scaled', from: 'Min_Max_Normalization_1_5_Scale_4',
    doc: 'Facilities planning — min-max normalized to a 1-5 scale.' },
  { name: 'bex_equity_index', from: 'School_Equity_Index',
    doc: 'School equity index — raw score.' },
  { name: 'bex_equity_index_scaled', from: 'Min_Max_Normalization_1_5_Scale_5',
    doc: 'School equity index — min-max normalized to a 1-5 scale.' },
  { name: 'bex_weighted_overall_score', from: 'Weighted_Overall_Score',
    doc: 'Weighted overall BEX-VI score.' },
  { name: 'bex_iv_rank', from: 'BEX_IV_Rank',
    doc: 'Building rank from the earlier BEX IV assessment.' },
];

export const BLDG_COLUMNS: JoinColumn[] = [
  { name: 'bldg_utilization_pct_2025', from: 'pct_2025_utilization',
    doc: 'Projected 2025 building utilization (enrollment / capacity).' },
  { name: 'bldg_condition_pct', from: 'pct_building_condition',
    doc: 'Building condition score, percent scale.' },
  { name: 'bldg_learning_env_score', from: 'learning_environment_score',
    doc: 'Learning environment score.' },
  { name: 'bldg_condition_score_2022', from: '_2022_building_condition_score',
    doc: 'Building condition score, 2022 assessment.' },
];

export const INCOME_COLUMNS: JoinColumn[] = [
  { name: 'income_es_zone', from: 'es_zone',
    doc: 'SPS elementary-school zone used to attribute area income (string).' },
  { name: 'income_area_worker_earnings_median', from: 'area_worker_earnings_median',
    doc: 'Median worker earnings in the school\'s attendance area.' },
  { name: 'income_area_percapita', from: 'area_percapita_income',
    doc: 'Per-capita income in the school\'s attendance area.' },
];

/** churn_* columns computed by the churn CTE (COALESCE(SUM(...), 0): a group
 * with no events is a real 0, not missing). */
export const CHURN_COLUMNS: Array<{ name: string; expr: string; doc: string }> = [
  { name: 'churn_transfer_in', expr: 'COALESCE(SUM(transfer_in), 0)',
    doc: 'Staff transferring into the building that year.' },
  { name: 'churn_transfer_out', expr: 'COALESCE(SUM(transfer_out), 0)',
    doc: 'Staff transferring out of the building that year.' },
  { name: 'churn_hire', expr: 'COALESCE(SUM(hire), 0)',
    doc: 'Staff newly hired into the building that year.' },
  { name: 'churn_depart', expr: 'COALESCE(SUM(depart), 0)',
    doc: 'Staff departing the district from the building that year.' },
  { name: 'churn_added', expr: 'COALESCE(SUM(transfer_in), 0) + COALESCE(SUM(hire), 0)',
    doc: 'Staff added (transfers in + hires).' },
  { name: 'churn_lost', expr: 'COALESCE(SUM(transfer_out), 0) + COALESCE(SUM(depart), 0)',
    doc: 'Staff lost (transfers out + departures).' },
  { name: 'churn_net', expr: '(COALESCE(SUM(transfer_in), 0) + COALESCE(SUM(hire), 0)) - ' +
    '(COALESCE(SUM(transfer_out), 0) + COALESCE(SUM(depart), 0))',
    doc: 'Net staff churn (added - lost).' },
];
