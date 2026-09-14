"""
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class WorkBase(BaseModel):
    work_id: str
    state: str
    district: str
    constituency: str
    house: Optional[str] = "Lok Sabha"
    mp_id: Optional[str] = ""
    mp_name: str
    work_title: str
    category: str
    implementing_agency: Optional[str] = ""
    vendor_id: str
    vendor_name: str
    recommendation_date: Optional[str] = ""
    sanction_date: str
    estimated_cost_inr: float
    sor_benchmark_cost_inr: float
    expenditure_incurred_inr: float
    completion_pct: float
    days_stalled: int
    work_status: str
    latitude: float
    longitude: float
    photo_phash: Optional[str] = ""
    photo_exif_lat: Optional[float] = 0.0
    photo_exif_lon: Optional[float] = 0.0
    declared_category_at_completion: Optional[str] = ""
    milestone_count: Optional[int] = 0
    anomaly_label: Optional[str] = "NORMAL"

    class Config:
        from_attributes = True


class AuditRecordOut(BaseModel):
    work_id: str
    risk_score: float
    verdict: str
    statutory_dossier: str
    flag_duplicate_work: bool
    flag_sor_inflated: bool
    flag_tender_splitting: bool
    flag_geo_tampering: bool
    flag_parked_funds: bool
    flag_expenditure_mismatch: bool
    flag_no_physical_evidence: bool
    flag_category_deviation: bool
    flag_recycled_photo: bool
    ml_anomaly_score: float
    days_to_dormancy_threshold: Optional[int]
    vendor_risk_tier: str
    is_statistical_outlier: Optional[bool] = False
    is_extreme_outlier: Optional[bool] = False
    state_cost_ratio: Optional[float] = 1.0
    terrain_multiplier: Optional[float] = 1.0
    outlier_diagnostic: Optional[str] = ""
    # enriched from work
    state: Optional[str] = None
    district: Optional[str] = None
    constituency: Optional[str] = None
    mp_id: Optional[str] = None
    mp_name: Optional[str] = None
    work_title: Optional[str] = None
    category: Optional[str] = None
    vendor_id: Optional[str] = None
    vendor_name: Optional[str] = None
    estimated_cost_inr: Optional[float] = None
    expenditure_incurred_inr: Optional[float] = None
    completion_pct: Optional[float] = None
    work_status: Optional[str] = None
    sanction_date: Optional[str] = None
    anomaly_label: Optional[str] = None

    class Config:
        from_attributes = True


class AlertOut(BaseModel):
    id: int
    work_id: str
    severity: str
    verdict: str
    target_role: str
    target_id: str
    summary: str
    statutory_dossier: str
    recommended_action: str
    acknowledged: bool

    class Config:
        from_attributes = True


class DashboardSummary(BaseModel):
    total_works: int
    total_sanctioned_inr: float
    total_disbursed_inr: float
    total_flagged: int
    statutory_holds: int
    compliance_inquiry: int
    capital_dormant: int
    verified_compliant: int
    high_risk_alerts: int


class IngestResponse(BaseModel):
    message: str
    works_ingested: int
    milestones_ingested: int
    pipeline_run: bool


class NoticeData(BaseModel):
    work_id: str
    mp_name: str
    mp_id: str
    constituency: str
    state: str
    district: str
    work_title: str
    category: str
    sanction_date: str
    estimated_cost_inr: float
    expenditure_incurred_inr: float
    completion_pct: float
    work_status: str
    vendor_name: str
    verdict: str
    risk_score: float
    statutory_dossier: str
    flags: List[str]
    recommended_action: str
    notice_date: str
