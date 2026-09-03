from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class ImportRecord(Base):
    __tablename__ = "import_records"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    job_id = Column(
        String,
        ForeignKey("import_jobs.id"),
        nullable=False,
        index=True
    )

    row_number = Column(
        Integer,
        nullable=False
    )

    name = Column(
        String,
        nullable=True
    )

    email = Column(
        String,
        nullable=True
    )

    phone = Column(
        String,
        nullable=True
    )

    company = Column(
        String,
        nullable=True
    )

    city = Column(
        String,
        nullable=True
    )

    is_valid = Column(
        Boolean,
        default=True,
        nullable=False
    )

    is_duplicate = Column(
        Boolean,
        default=False,
        nullable=False
    )

    validation_errors = Column(
        Text,
        nullable=True
    )

    job = relationship(
        "ImportJob",
        back_populates="records"
    )