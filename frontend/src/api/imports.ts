import type {
  ImportJob,
  PaginatedRecordsResponse,
  UploadResponse,
} from "../types/import";


const API_BASE_URL = "http://127.0.0.1:8000/api";


export async function uploadCsv(
  file: File
): Promise<UploadResponse> {
  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(
    `${API_BASE_URL}/imports`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();

    throw new Error(
      error.detail || "Failed to upload CSV file."
    );
  }

  return response.json();
}


export async function getImportHistory(): Promise<ImportJob[]> {
  const response = await fetch(
    `${API_BASE_URL}/imports`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load import history."
    );
  }

  return response.json();
}


export async function getImportJob(
  jobId: string
): Promise<ImportJob> {
  const response = await fetch(
    `${API_BASE_URL}/imports/${jobId}`
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load import details."
    );
  }

  return response.json();
}


interface GetRecordsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: "valid" | "invalid" | "duplicate";
}


export async function getImportRecords(
  jobId: string,
  params: GetRecordsParams = {}
): Promise<PaginatedRecordsResponse> {
  const queryParams = new URLSearchParams();

  if (params.page) {
    queryParams.append(
      "page",
      String(params.page)
    );
  }

  if (params.pageSize) {
    queryParams.append(
      "page_size",
      String(params.pageSize)
    );
  }

  if (params.search) {
    queryParams.append(
      "search",
      params.search
    );
  }

  if (params.status) {
    queryParams.append(
      "status",
      params.status
    );
  }

  const queryString = queryParams.toString();

  const url = queryString
    ? `${API_BASE_URL}/imports/${jobId}/records?${queryString}`
    : `${API_BASE_URL}/imports/${jobId}/records`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      "Failed to load import records."
    );
  }

  return response.json();
}


export function getDownloadUrl(
  jobId: string
): string {
  return `${API_BASE_URL}/imports/${jobId}/download`;
}