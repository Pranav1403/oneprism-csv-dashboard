import csv
import io
import math

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    HTTPException,
    Query,
    UploadFile,
)
from fastapi.responses import StreamingResponse
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import SessionLocal, get_db
from app.models.import_job import ImportJob
from app.models.import_record import ImportRecord
from app.schemas.import_schema import (
    ImportJobResponse,
    PaginatedRecordsResponse,
    UploadResponse,
)
from app.services.csv_service import (
    create_import_job,
    parse_validation_errors,
    process_csv_import,
    validate_csv_file,
)


router = APIRouter(
    prefix="/api/imports",
    tags=["Imports"],
)


def process_import_in_background(
    job_id: str,
    file_content: bytes
):
    """
    Create a separate database session for the background task.
    """

    db = SessionLocal()

    try:
        process_csv_import(
            db=db,
            job_id=job_id,
            file_content=file_content,
        )
    finally:
        db.close()


# =========================================================
# UPLOAD CSV
# =========================================================

@router.post(
    "",
    response_model=UploadResponse,
    status_code=201,
)
async def upload_csv(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Please select a CSV file."
        )

    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Please upload a CSV file."
        )

    try:
        file_content = await file.read()

        validate_csv_file(file_content)

        job = create_import_job(
            db=db,
            filename=file.filename,
        )

        background_tasks.add_task(
            process_import_in_background,
            job.id,
            file_content,
        )

        return {
            "message": (
                "CSV uploaded successfully. "
                "Import processing has started."
            ),
            "job_id": job.id,
            "status": job.status,
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception as error:
        print(f"Upload failed: {error}")

        raise HTTPException(
            status_code=500,
            detail=(
                "An unexpected error occurred "
                "while creating the import job."
            )
        )


# =========================================================
# IMPORT HISTORY
# =========================================================

@router.get(
    "",
    response_model=list[ImportJobResponse],
)
def get_import_history(
    db: Session = Depends(get_db),
):
    """
    Return all previous import jobs.
    """

    jobs = (
        db.query(ImportJob)
        .order_by(ImportJob.created_at.desc())
        .all()
    )

    return jobs


# =========================================================
# SINGLE IMPORT JOB
# =========================================================

@router.get(
    "/{job_id}",
    response_model=ImportJobResponse,
)
def get_import_job(
    job_id: str,
    db: Session = Depends(get_db),
):
    """
    Return job status and summary.
    """

    job = (
        db.query(ImportJob)
        .filter(ImportJob.id == job_id)
        .first()
    )

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Import job not found."
        )

    return job


# =========================================================
# IMPORT RECORDS
# =========================================================

@router.get(
    "/{job_id}/records",
    response_model=PaginatedRecordsResponse,
)
def get_import_records(
    job_id: str,

    page: int = Query(
        default=1,
        ge=1,
    ),

    page_size: int = Query(
        default=10,
        ge=1,
        le=100,
    ),

    search: str | None = Query(
        default=None,
    ),

    status: str | None = Query(
        default=None,
        description="Filter: valid, invalid, duplicate",
    ),

    db: Session = Depends(get_db),
):
    """
    Get CSV records with search, filtering and pagination.
    """

    job = (
        db.query(ImportJob)
        .filter(ImportJob.id == job_id)
        .first()
    )

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Import job not found."
        )

    query = (
        db.query(ImportRecord)
        .filter(ImportRecord.job_id == job_id)
    )

    # Search records
    if search:
        search_value = f"%{search.strip()}%"

        query = query.filter(
            or_(
                ImportRecord.name.ilike(search_value),
                ImportRecord.email.ilike(search_value),
                ImportRecord.phone.ilike(search_value),
                ImportRecord.company.ilike(search_value),
                ImportRecord.city.ilike(search_value),
            )
        )

    # Filter records
    if status:
        status = status.lower()

        if status == "valid":
            query = query.filter(
                ImportRecord.is_valid.is_(True)
            )

        elif status == "invalid":
            query = query.filter(
                ImportRecord.is_valid.is_(False)
            )

        elif status == "duplicate":
            query = query.filter(
                ImportRecord.is_duplicate.is_(True)
            )

        else:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid status filter. "
                    "Use: valid, invalid, or duplicate."
                )
            )

    total = query.count()

    total_pages = (
        math.ceil(total / page_size)
        if total > 0
        else 0
    )

    records = (
        query
        .order_by(ImportRecord.row_number.asc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    formatted_records = []

    for record in records:
        formatted_records.append(
            {
                "id": record.id,
                "row_number": record.row_number,
                "name": record.name,
                "email": record.email,
                "phone": record.phone,
                "company": record.company,
                "city": record.city,
                "is_valid": record.is_valid,
                "is_duplicate": record.is_duplicate,
                "validation_errors": parse_validation_errors(
                    record.validation_errors
                ),
            }
        )

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages,
        "records": formatted_records,
    }


# =========================================================
# DOWNLOAD VALID RECORDS
# =========================================================

@router.get(
    "/{job_id}/download",
)
def download_valid_records(
    job_id: str,
    db: Session = Depends(get_db),
):
    """
    Download all valid records as a CSV file.
    """

    job = (
        db.query(ImportJob)
        .filter(ImportJob.id == job_id)
        .first()
    )

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Import job not found."
        )

    valid_records = (
        db.query(ImportRecord)
        .filter(
            ImportRecord.job_id == job_id,
            ImportRecord.is_valid.is_(True),
        )
        .order_by(ImportRecord.row_number.asc())
        .all()
    )

    output = io.StringIO()

    writer = csv.writer(output)

    writer.writerow([
        "name",
        "email",
        "phone",
        "company",
        "city",
    ])

    for record in valid_records:
        writer.writerow([
            record.name,
            record.email,
            record.phone,
            record.company,
            record.city,
        ])

    output.seek(0)

    filename = (
        f"valid_records_{job_id}.csv"
    )

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition":
            f'attachment; filename="{filename}"'
        },
    )