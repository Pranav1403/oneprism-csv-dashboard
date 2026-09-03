import uuid

from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class ImportJob(Base):
    __tablename__ = "import_jobs"

    id = Column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        index=True
    )

    filename = Column(
        String,
        nullable=False
    )

    status = Column(
        String,
        nullable=False,
        default="Pending"
    )

    total_records = Column(
        Integer,
        default=0
    )

    valid_records = Column(
        Integer,
        default=0
    )

    invalid_records = Column(
        Integer,
        default=0
    )

    duplicate_records = Column(
        Integer,
        default=0
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    records = relationship(
        "ImportRecord",
        back_populates="job",
        cascade="all, delete-orphan"
    )