import type {
  ImportJob,
} from "../../types/import";

import SummaryCard from "./SummaryCard";


interface ImportSummaryProps {
  job: ImportJob;
}


function ImportSummary({
  job,
}: ImportSummaryProps) {
  return (
    <section className="import-summary">

      <SummaryCard
        title="Total Records"
        value={job.total_records}
        type="total"
      />

      <SummaryCard
        title="Valid Records"
        value={job.valid_records}
        type="valid"
      />

      <SummaryCard
        title="Invalid Records"
        value={job.invalid_records}
        type="invalid"
      />

      <SummaryCard
        title="Duplicates"
        value={job.duplicate_records}
        type="duplicate"
      />

    </section>
  );
}


export default ImportSummary;