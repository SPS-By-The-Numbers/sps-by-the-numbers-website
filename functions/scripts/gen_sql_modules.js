// Regenerates the embedded SQL string modules from the .sql sources:
//   node scripts/gen_sql_modules.js          (from functions/)
// The .sql files are the editable sources; the .ts modules are what the
// bundler embeds. Backticks are banned in the .sql (BigQuery accepts dashed
// project paths unquoted) so the strings stay JSON-stringifiable verbatim.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'bigsheet', 'sql');
const MODULES = [
  ['vitals.sql', 'vitalsSql.ts', 'RAW_VITALS_SQL'],
  ['assessment.sql', 'assessmentSql.ts', 'RAW_ASSESSMENT_SQL'],
];

for (const [sql, ts, cname] of MODULES) {
  const content = fs.readFileSync(path.join(DIR, sql), 'utf8');
  if (content.includes('`')) throw new Error(`${sql} contains backticks`);
  const out = `// AUTO-GENERATED from sql/${sql} — do not hand-edit. Regenerate via:\n` +
    `//   node scripts/gen_sql_modules.js   (from functions/)\n\n` +
    `export const ${cname} = ${JSON.stringify(content)};\n`;
  fs.writeFileSync(path.join(DIR, ts), out);
  console.log(`wrote ${ts} (${out.length} bytes)`);
}
