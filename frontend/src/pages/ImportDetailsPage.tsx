import useDebounce from "../hooks/useDebounce";

import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import Loading from "../components/common/Loading";

import ImportSummary from "../components/imports/ImportSummary";

import RecordFilters, {
  type RecordStatusFilter,
} from "../components/imports/RecordFilters";

import RecordsTable from "../components/imports/RecordsTable";

import Pagination from "../components/imports/Pagination";


import {
  getDownloadUrl,
  getImportJob,
  getImportRecords,
} from "../api/imports";


import type {
  ImportJob,
  ImportRecord,
} from "../types/import";


const PAGE_SIZE = 10;


function ImportDetailsPage() {

  const { jobId } =
    useParams();


  const [job, setJob] =
    useState<ImportJob | null>(null);


  const [records, setRecords] =
    useState<ImportRecord[]>([]);


  const [loading, setLoading] =
    useState(true);


  const [recordsLoading, setRecordsLoading] =
    useState(false);


  const [error, setError] =
    useState<string | null>(null);


  const [search, setSearch] =
    useState("");

  const debouncedSearch =
  useDebounce(search, 500);

  const [status, setStatus] =
    useState<RecordStatusFilter>("");


  const [page, setPage] =
    useState(1);


  const [totalPages, setTotalPages] =
    useState(0);


  const [totalRecords, setTotalRecords] =
    useState(0);


  // =====================================
  // LOAD IMPORT JOB
  // =====================================

  async function loadJob() {

    if (!jobId) {
      return;
    }


    try {

      const data =
        await getImportJob(jobId);

      setJob(data);

    } catch (error) {

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load import."
      );

    } finally {

      setLoading(false);

    }

  }


  // =====================================
  // LOAD RECORDS
  // =====================================

  async function loadRecords() {

    if (!jobId) {
      return;
    }


    try {

      setRecordsLoading(true);

      const data =
        await getImportRecords(
          jobId,
          {
            page,
            pageSize: PAGE_SIZE,

            search:
               debouncedSearch || undefined,

            status:
              status || undefined,
          }
        );


      setRecords(
        data.records
      );

      setTotalPages(
        data.total_pages
      );

      setTotalRecords(
        data.total
      );

    } catch (error) {

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load records."
      );

    } finally {

      setRecordsLoading(false);

    }

  }


  // =====================================
  // INITIAL JOB LOAD
  // =====================================

  useEffect(() => {

    loadJob();

  }, [jobId]);


  // =====================================
  // RECORDS LOAD
  // =====================================

  useEffect(() => {

  if (
    job?.status === "Completed"
  ) {

    loadRecords();

  }

}, [
  job?.status,
  page,
  status,
  debouncedSearch,
]);


  // =====================================
  // AUTO POLLING
  // =====================================

  useEffect(() => {

    if (
      !job ||
      job.status === "Completed" ||
      job.status === "Failed"
    ) {
      return;
    }


    const interval =
      setInterval(
        () => {

          loadJob();

        },
        2000
      );


    return () => {

      clearInterval(interval);

    };

  }, [
    job?.status,
    jobId,
  ]);


  // =====================================
  // SEARCH HANDLER
  // =====================================

  function handleSearchChange(
    value: string
  ) {

    setSearch(value);

    setPage(1);

  }


  // =====================================
  // STATUS FILTER HANDLER
  // =====================================

  function handleStatusChange(
    value: RecordStatusFilter
  ) {

    setStatus(value);

    setPage(1);

  }


  // =====================================
  // LOADING
  // =====================================

  if (loading) {

    return (
      <Loading
        message="Loading import..."
      />
    );

  }


  // =====================================
  // ERROR
  // =====================================

  if (error) {

    return (
      <div className="error-message">
        {error}
      </div>
    );

  }


  // =====================================
  // JOB NOT FOUND
  // =====================================

  if (!job) {

    return (
      <div>

        <p>
          Import not found.
        </p>

        <Link to="/">
          Back to Dashboard
        </Link>

      </div>
    );

  }


  const isProcessing =
    job.status === "Pending" ||
    job.status === "Processing";


  return (
    <div className="import-details-page">


      {/* BACK BUTTON */}

      <Link
        to="/"
        className="back-link"
      >
        ← Back to Dashboard
      </Link>


      {/* HEADER */}

      <div className="details-header">

        <div>

          <h1>
            {job.filename}
          </h1>

          <p>
            Import Results
          </p>

        </div>


        <span
          className={`status-badge status-${job.status.toLowerCase()}`}
        >
          {job.status}
        </span>

      </div>


      {/* PROCESSING MESSAGE */}

      {isProcessing && (

        <div className="processing-message">

          <strong>
            Processing your CSV...
          </strong>

          <p>
            The page automatically refreshes
            while validation is running.
          </p>

        </div>

      )}


      {/* SUMMARY */}

      <ImportSummary
        job={job}
      />


      {/* DOWNLOAD */}

      {job.status === "Completed" && (

        <div className="download-section">

          <div>

            <h2>
              Valid Records
            </h2>

            <p>
              Download all validated records
              as a CSV file.
            </p>

          </div>


          <a
            href={
              getDownloadUrl(job.id)
            }
            className="download-button"
          >
            Download Valid CSV
          </a>

        </div>

      )}


      {/* RECORDS */}

      {job.status === "Completed" && (

        <section className="records-section">

          <div className="records-header">

            <div>

              <h2>
                Records
              </h2>

              <p>
                {totalRecords} records found
              </p>

            </div>

          </div>


          <RecordFilters
            search={search}
            status={status}
            onSearchChange={
              handleSearchChange
            }
            onStatusChange={
              handleStatusChange
            }
          />


          {recordsLoading ? (

            <Loading
              message="Loading records..."
            />

          ) : (

            <>

              <RecordsTable
                records={records}
              />


              <Pagination
                page={page}
                totalPages={
                  totalPages
                }
                onPageChange={
                  setPage
                }
              />

            </>

          )}

        </section>

      )}


      {/* FAILED */}

      {job.status === "Failed" && (

  <div className="failed-message">

    <h2>
      Import Failed
    </h2>

    <p>
      This CSV file could not be processed.
      Please check the file format and
      try uploading it again.
    </p>

    <Link
      to="/"
      className="retry-link"
    >
      Upload Another File
    </Link>

  </div>

  )}

    </div>
  );
}


export default ImportDetailsPage;