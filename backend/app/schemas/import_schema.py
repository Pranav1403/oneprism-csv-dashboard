from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class UploadResponse(BaseModel):
    message: str
    job_id: str
    status: str


class ImportJobResponse(BaseModel):
    id: str
    filename: str
    status: str
    total_records: int
    valid_records: int
    invalid_records: int
    duplicate_records: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ValidationRecordResponse(BaseModel):
    id: int
    row_number: int

    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    city: Optional[str] = None

    is_valid: bool
    is_duplicate: bool
    validation_errors: list[str]


class PaginatedRecordsResponse(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int

    records: list[ValidationRecordResponse]