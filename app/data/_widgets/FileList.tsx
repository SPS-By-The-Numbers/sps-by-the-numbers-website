import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

const BUCKET_PREFIX = "https://storage.googleapis.com/sps-btn-data-all-data/";

export type FileEntry = {
  file: string;
  path: string;
};

type Props = {
  files: FileEntry[];
  label?: (entry: FileEntry) => React.ReactNode;
  empty?: string;
};

export default function FileList({ files, label, empty }: Props) {
  if (files.length === 0) {
    return (
      <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic" }}>
        {empty ?? "No files."}
      </Typography>
    );
  }
  return (
    <ul style={{ columns: files.length > 12 ? 2 : 1, columnGap: "2em" }}>
      {files.map((f) => (
        <li key={f.path} style={{ breakInside: "avoid" }}>
          <Link href={`${BUCKET_PREFIX}${f.path}`}>
            {label ? label(f) : f.file}
          </Link>
        </li>
      ))}
    </ul>
  );
}
