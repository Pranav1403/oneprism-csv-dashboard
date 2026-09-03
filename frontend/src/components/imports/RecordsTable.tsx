import type {
  ImportRecord,
} from "../../types/import";


interface RecordsTableProps {
  records: ImportRecord[];
}


function RecordsTable({
  records,
}: RecordsTableProps) {
  if (records.length === 0) {
    return (
      <div className="no-records">
        No records found.
      </div>
    );
  }


  return (
    <div className="table-wrapper">

      <table className="records-table">

        <thead>

          <tr>
            <th>Row</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Company</th>
            <th>City</th>
            <th>Status</th>
            <th>Errors</th>
          </tr>

        </thead>


        <tbody>

          {records.map(
            (record) => (

              <tr
                key={record.id}
              >

                <td>
                  {record.row_number}
                </td>


                <td>
                  {record.name || "-"}
                </td>


                <td>
                  {record.email || "-"}
                </td>


                <td>
                  {record.phone || "-"}
                </td>


                <td>
                  {record.company || "-"}
                </td>


                <td>
                  {record.city || "-"}
                </td>


                <td>

                  {record.is_duplicate ? (

                    <span className="record-status duplicate">
                      Duplicate
                    </span>

                  ) : record.is_valid ? (

                    <span className="record-status valid">
                      Valid
                    </span>

                  ) : (

                    <span className="record-status invalid">
                      Invalid
                    </span>

                  )}

                </td>


                <td>

                  {record.validation_errors
                    .length === 0 ? (

                    <span className="no-errors">
                      -
                    </span>

                  ) : (

                    <ul className="validation-errors">

                      {record.validation_errors.map(
                        (
                          error,
                          index
                        ) => (

                          <li
                            key={`${record.id}-${index}`}
                          >
                            {error}
                          </li>

                        )
                      )}

                    </ul>

                  )}

                </td>

              </tr>

            )
          )}

        </tbody>

      </table>

    </div>
  );
}


export default RecordsTable;