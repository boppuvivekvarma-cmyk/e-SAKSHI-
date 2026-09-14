"""
SQLAlchemy ORM models for e-SAKSHI 2.0 Sentinel.
"""
from sqlalchemy import Column, String, Float, Integer, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


class Work(Base):
    __tablename__ = "works"

    work_id             = Column(String, primary_key=True, index=True)
    state               = Column(String, index=True)
    district            = Column(String, index=True)
    constituency        = Column(String, index=True)
    house               = Column(String)
    mp_id               = Column(String, index=True)
    mp_name             = Column(String)
    work_title          = Column(String)
    category            = Column(String, index=True)
    implementing_agency = Column(String)
    vendor_id           = Column(String, index=True)
    vendor_name         = Column(String)
    recommendation_date = Column(String)
    sanction_date       = Column(String)
    estimated_cost_inr  = Column(Float)
    sor_benchmark_cost_inr = Column(Float)
    expenditure_incurred_inr = Column(Float)
    completion_pct      = Column(Float)
    days_stalled        = Column(Integer)
    work_status         = Column(String, index=True)
    latitude            = Column(Float)
    longitude           = Column(Float)
    photo_phash         = Column(String)
    photo_exif_lat      = Column(Float)
    photo_exif_lon      = Column(Float)
    declared_category_at_completion = Column(String, nullable=True)
    milestone_count     = Column(Integer, default=0)
    anomaly_label       = Column(String, default="NORMAL")

    # back-populated
    audit_record        = relationship("AuditRecord", back_populates="work", uselist=False)
    milestones          = relationship("MilestonePhoto", back_populates="work")


class MilestonePhoto(Base):
    __tablename__ = "milestone_photos"

    milestone_id    = Column(String, primary_key=True)
    work_id         = Column(String, ForeignKey("works.work_id"), index=True)
    stage           = Column(String)   # before | during | after
    captured_at     = Column(String)
    photo_phash     = Column(String)
    photo_exif_lat  = Column(Float)
    photo_exif_lon  = Column(Float)
    declared_category = Column(String)

    work = relationship("Work", back_populates="milestones")


class AuditRecord(Base):
    __tablename__ = "audit_records"

    id              = Column(Integer, primary_key=True, autoincrement=True)
    work_id         = Column(String, ForeignKey("works.work_id"), unique=True, index=True)
    risk_score      = Column(Float, default=0)
    verdict         = Column(String, default="VERIFIED COMPLIANT")
    statutory_dossier = Column(Text, default="")

    # Individual engine flags
    flag_duplicate_work         = Column(Boolean, default=False)
    flag_sor_inflated           = Column(Boolean, default=False)
    flag_tender_splitting       = Column(Boolean, default=False)
    flag_geo_tampering          = Column(Boolean, default=False)
    flag_parked_funds           = Column(Boolean, default=False)
    flag_expenditure_mismatch   = Column(Boolean, default=False)
    flag_no_physical_evidence   = Column(Boolean, default=False)
    flag_category_deviation     = Column(Boolean, default=False)
    flag_recycled_photo         = Column(Boolean, default=False)
    ml_anomaly_score            = Column(Float, default=0.0)

    # Predictive
    days_to_dormancy_threshold  = Column(Integer, nullable=True)
    projected_dormancy_risk     = Column(Boolean, default=False)

    # Vendor risk
    vendor_risk_tier            = Column(String, default="LOW")

    # Pan-India Outlier Intelligence
    is_statistical_outlier      = Column(Boolean, default=False)
    is_extreme_outlier          = Column(Boolean, default=False)
    state_cost_ratio            = Column(Float, default=1.0)
    terrain_multiplier          = Column(Float, default=1.0)
    outlier_diagnostic          = Column(String, default="")

    created_at      = Column(DateTime, server_default=func.now())

    work = relationship("Work", back_populates="audit_record")


class Alert(Base):
    __tablename__ = "alerts"

    id              = Column(Integer, primary_key=True, autoincrement=True)
    work_id         = Column(String, ForeignKey("works.work_id"), index=True)
    severity        = Column(String)    # HIGH | MEDIUM | LOW
    verdict         = Column(String)
    target_role     = Column(String)    # mp | district | state | ministry
    target_id       = Column(String)    # mp_id / district / state
    summary         = Column(Text)
    statutory_dossier = Column(Text)
    recommended_action = Column(Text)
    acknowledged    = Column(Boolean, default=False)
    created_at      = Column(DateTime, server_default=func.now())
