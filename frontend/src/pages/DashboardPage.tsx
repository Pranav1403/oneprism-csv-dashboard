import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  Link,
  useLocation,
} from "react-router-dom";

import Loading from "../components/common/Loading";

import FileUpload from "../components/imports/FileUpload";

import {
  getImportHistory,
} from "../api/imports";

import type {
  ImportJob,
} from "../types/import";


function DashboardPage() {
  const navigate =
    useNavigate();

  const location =
  useLocation();  

  const [imports, setImports] =
    useState<ImportJob[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);


  async function loadImports() {
    try {
      setLoading(true);

      const data =
        await getImportHistory();

      setImports(data);

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }


  useEffect(() => {
  loadImports();
}, [
  location.pathname,
]);

  function handleUploadSuccess(
    jobId: string
  ) {
    navigate(
      `/imports/${jobId}`
    );
  }


  if (loading) {
    return (
      <Loading message="Loading dashboard..." />
    );
  }


  if (error) {
    return (
      <div className="error-message">
        {error}
      </div>
    );
  }


  return (
    <div className="dashboard-page">

      <div className="dashboard-header">

        <div>
          <h1>
            CSV Import Dashboard
          </h1>

          <p>
            Upload and validate customer CSV files.
          </p>
        </div>

      </div>


      {/* Upload Section */}

      <FileUpload
        onUploadSuccess={
          handleUploadSuccess
        }
      />


      {/* Import History */}

      <section className="import-history">

        <div className="section-header">

          <h2>
            Import History
          </h2>

          <span>
            {imports.length} imports
          </span>

        </div>


        {imports.length === 0 ? (

          <div className="empty-state">

            <h3>
              No imports yet
            </h3>

            <p>
              Upload a CSV file to get started.
            </p>

          </div>

        ) : (

          <div className="history-list">

            {imports.map(
              (importJob) => (

                <Link
                  key={importJob.id}
                  to={
                    `/imports/${importJob.id}`
                  }
                  className="history-item"
                >

                  <div>

                    <strong>
                      {importJob.filename}
                    </strong>

                    <p>
                      {importJob.total_records}
                      {" "}
                      records
                    </p>

                  </div>


                  <span
                    className={`status-badge status-${importJob.status.toLowerCase()}`}
                  >
                    {importJob.status}
                  </span>

                </Link>

              )
            )}

          </div>

        )}

      </section>

    </div>
  );
}


export default DashboardPage;