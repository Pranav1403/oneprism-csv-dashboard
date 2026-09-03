export type ImportStatus =
  | "Pending"
  | "Processing"
  | "Completed"
  | "Failed";


export interface UploadResponse {
  message: string;
  job_id: string;
  status: ImportStatus;
}


export interface ImportJob {
  id: string;
  filename: string;
  status: ImportStatus;
  total_records: number;
  valid_records: number;
  invalid_records: number;
  duplicate_records: number;
  created_at?: string;
}


export interface ImportRecord {
  id: number;
  row_number: number;

  name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  city: string | null;

  is_valid: boolean;
  is_duplicate: boolean;

  validation_errors: string[];
}


export interface PaginatedRecordsResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;

  records: ImportRecord[];
}