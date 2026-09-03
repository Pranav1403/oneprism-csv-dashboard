export type RecordStatusFilter =
  | ""
  | "valid"
  | "invalid"
  | "duplicate";


interface RecordFiltersProps {
  search: string;

  status: RecordStatusFilter;

  onSearchChange: (
    value: string
  ) => void;

  onStatusChange: (
    value: RecordStatusFilter
  ) => void;
}


function RecordFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: RecordFiltersProps) {
  return (
    <div className="record-filters">

      <input
        type="text"
        placeholder="Search name, email, phone..."
        value={search}
        onChange={(event) =>
          onSearchChange(
            event.target.value
          )
        }
        className="search-input"
      />


      <select
        value={status}
        onChange={(event) =>
          onStatusChange(
            event.target
              .value as RecordStatusFilter
          )
        }
        className="status-filter"
      >

        <option value="">
          All Records
        </option>

        <option value="valid">
          Valid
        </option>

        <option value="invalid">
          Invalid
        </option>

        <option value="duplicate">
          Duplicates
        </option>

      </select>

    </div>
  );
}


export default RecordFilters;