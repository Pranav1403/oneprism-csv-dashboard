import {
  useRef,
  useState,
  type DragEvent,
  type ChangeEvent,
} from "react";

import { uploadCsv } from "../../api/imports";


interface FileUploadProps {
  onUploadSuccess: (jobId: string) => void;
}


function FileUpload({
  onUploadSuccess,
}: FileUploadProps) {
  const inputRef =
    useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [dragActive, setDragActive] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);


  function validateAndSetFile(
    file: File
  ) {
    setError(null);

    if (
      !file.name
        .toLowerCase()
        .endsWith(".csv")
    ) {
      setSelectedFile(null);

      setError(
        "Please select a CSV file."
      );

      return;
    }

    setSelectedFile(file);
  }


  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (file) {
      validateAndSetFile(file);
    }
  }


  function handleDragOver(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();

    setDragActive(true);
  }


  function handleDragLeave(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();

    setDragActive(false);
  }


  function handleDrop(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();

    setDragActive(false);

    const file =
      event.dataTransfer.files?.[0];

    if (file) {
      validateAndSetFile(file);
    }
  }


  function handleBrowseClick() {
    inputRef.current?.click();
  }


  function handleRemoveFile() {
    setSelectedFile(null);
    setError(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }


  function formatFileSize(
    bytes: number
  ) {
    if (bytes === 0) {
      return "0 Bytes";
    }

    const sizes = [
      "Bytes",
      "KB",
      "MB",
      "GB",
    ];

    const index = Math.floor(
      Math.log(bytes) /
      Math.log(1024)
    );

    return `${(
      bytes /
      Math.pow(1024, index)
    ).toFixed(2)} ${sizes[index]}`;
  }


  async function handleUpload() {
    if (!selectedFile) {
      setError(
        "Please select a CSV file first."
      );

      return;
    }

    try {
      setUploading(true);
      setError(null);

      const response =
        await uploadCsv(selectedFile);

      onUploadSuccess(
        response.job_id
      );

    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to upload CSV file."
      );
    } finally {
      setUploading(false);
    }
  }


  return (
    <section className="upload-section">

      <div
        className={`drop-zone ${
          dragActive
            ? "drop-zone-active"
            : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >

        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          className="file-input"
        />


        {!selectedFile ? (
          <>
            <div className="upload-icon">
              ↑
            </div>

            <h2>
              Upload CSV File
            </h2>

            <p>
              Drag and drop your CSV file here
            </p>

            <p>
              or
            </p>

            <button
              type="button"
              className="browse-button"
              onClick={handleBrowseClick}
            >
              Browse File
            </button>

            <p className="upload-hint">
              Only CSV files are supported.
            </p>
          </>
        ) : (
          <div className="selected-file">

            <div className="file-info">

              <div className="file-icon">
                CSV
              </div>

              <div>

                <strong>
                  {selectedFile.name}
                </strong>

                <p>
                  {formatFileSize(
                    selectedFile.size
                  )}
                </p>

              </div>

            </div>


            <div className="file-actions">

              <button
                type="button"
                className="remove-button"
                onClick={handleRemoveFile}
                disabled={uploading}
              >
                Remove
              </button>


              <button
                type="button"
                className="upload-button"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading
                  ? "Uploading..."
                  : "Upload & Validate"}
              </button>

            </div>

          </div>
        )}

      </div>


      {error && (
        <div className="upload-error">
          {error}
        </div>
      )}

    </section>
  );
}


export default FileUpload;