import csv
import io
import json
import re

from sqlalchemy.orm import Session

from app.models.import_job import ImportJob
from app.models.import_record import ImportRecord


REQUIRED_COLUMNS = {
    "name",
    "email",
    "phone",
    "company",
    "city",
}


def validate_csv_file(file_content: bytes) -> list[str]:
    """
    Validate the basic CSV structure and return column names.
    """

    try:
        decoded_content = file_content.decode("utf-8-sig")
    except UnicodeDecodeError:
        raise ValueError(
            "The CSV file must use UTF-8 encoding."
        )

    if not decoded_content.strip():
        raise ValueError(
            "The uploaded CSV file is empty."
        )

    try:
        csv_file = io.StringIO(decoded_content)

        reader = csv.DictReader(csv_file)

        if not reader.fieldnames:
            raise ValueError(
                "The CSV file does not contain column headers."
            )

        columns = {
            column.strip().lower()
            for column in reader.fieldnames
            if column
        }

        missing_columns = REQUIRED_COLUMNS - columns

        if missing_columns:
            raise ValueError(
                "Missing required columns: "
                + ", ".join(sorted(missing_columns))
            )

        return reader.fieldnames

    except csv.Error as error:
        raise ValueError(
            f"Malformed CSV file: {str(error)}"
        )


def create_import_job(
    db: Session,
    filename: str
) -> ImportJob:

    job = ImportJob(
        filename=filename,
        status="Pending",
        total_records=0,
        valid_records=0,
        invalid_records=0,
        duplicate_records=0,
    )

    db.add(job)
    db.commit()
    db.refresh(job)

    return job


def validate_email(email: str) -> bool:
    """
    Validate basic email format.
    """

    email_pattern = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"

    return bool(
        re.match(
            email_pattern,
            email.strip()
        )
    )


def validate_phone(phone: str) -> bool:
    """
    Validate phone numbers.

    We allow:
    - 10 to 15 digits
    - Spaces
    - Hyphens
    - Parentheses
    - Optional leading +
    """

    cleaned_phone = re.sub(
        r"[\s\-\(\)]",
        "",
        phone.strip()
    )

    if cleaned_phone.startswith("+"):
        cleaned_phone = cleaned_phone[1:]

    return cleaned_phone.isdigit() and 10 <= len(cleaned_phone) <= 15


def validate_record(
    record: dict,
    seen_emails: set
) -> tuple[list[str], bool]:
    """
    Validate one CSV record.

    Returns:
    - List of validation errors
    - Whether the email is a duplicate
    """

    errors = []

    name = (record.get("name") or "").strip()
    email = (record.get("email") or "").strip()
    phone = (record.get("phone") or "").strip()
    company = (record.get("company") or "").strip()

    # Missing name
    if not name:
        errors.append("Name is required.")

    # Invalid email
    if not email:
        errors.append("Email is required.")
    elif not validate_email(email):
        errors.append("Invalid email address.")

    # Duplicate email in the uploaded file
    is_duplicate = False

    if email and email.lower() in seen_emails:
        errors.append("Duplicate email found in this file.")
        is_duplicate = True
    elif email:
        seen_emails.add(email.lower())

    # Invalid phone number
    if not phone:
        errors.append("Phone number is required.")
    elif not validate_phone(phone):
        errors.append(
            "Invalid phone number. Please provide 10 to 15 digits."
        )

    # Missing company
    if not company:
        errors.append("Company is required.")

    return errors, is_duplicate


def process_csv_import(
    db: Session,
    job_id: str,
    file_content: bytes
):
    """
    Process the uploaded CSV in the background.
    """

    job = None

    try:
        job = (
            db.query(ImportJob)
            .filter(ImportJob.id == job_id)
            .first()
        )

        if not job:
            return

        # Update job status
        job.status = "Processing"
        db.commit()

        decoded_content = file_content.decode("utf-8-sig")

        csv_file = io.StringIO(decoded_content)

        reader = csv.DictReader(csv_file)

        seen_emails = set()

        total_records = 0
        valid_records = 0
        invalid_records = 0
        duplicate_records = 0

        for row_number, row in enumerate(
            reader,
            start=2
        ):
            total_records += 1

            # Normalize keys and values
            normalized_record = {
                (key or "").strip().lower():
                (value or "").strip()
                for key, value in row.items()
            }

            errors, is_duplicate = validate_record(
                normalized_record,
                seen_emails
            )

            is_valid = len(errors) == 0

            if is_valid:
                valid_records += 1
            else:
                invalid_records += 1

            if is_duplicate:
                duplicate_records += 1

            import_record = ImportRecord(
                job_id=job_id,
                row_number=row_number,
                name=normalized_record.get("name"),
                email=normalized_record.get("email"),
                phone=normalized_record.get("phone"),
                company=normalized_record.get("company"),
                city=normalized_record.get("city"),
                is_valid=is_valid,
                is_duplicate=is_duplicate,
                validation_errors=json.dumps(errors),
            )

            db.add(import_record)

        job.total_records = total_records
        job.valid_records = valid_records
        job.invalid_records = invalid_records
        job.duplicate_records = duplicate_records
        job.status = "Completed"

        db.commit()

    except Exception as error:
        print(f"Import processing failed: {error}")

        db.rollback()

        if job:
            try:
                job.status = "Failed"
                db.commit()
            except Exception as status_error:
                print(
                    f"Failed to update job status: {status_error}"
                )

def parse_validation_errors(
    validation_errors: str | None
) -> list[str]:
    """
    Convert stored JSON validation errors into a Python list.
    """

    if not validation_errors:
        return []

    try:
        return json.loads(validation_errors)
    except (json.JSONDecodeError, TypeError):
        return [
            "Unable to read validation errors."
        ]                