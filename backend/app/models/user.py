from sqlalchemy import Column, Integer, String, JSON, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from backend.app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String(10), nullable=True)

    # JSONB-compatible fields (list of strings)
    existing_conditions = Column(JSON, nullable=True, default=list)
    allergies = Column(JSON, nullable=True, default=list)

    # Timestamps
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    auth_sessions = relationship("AuthSession", back_populates="user", cascade="all, delete-orphan")
    medical_profile = relationship("MedicalProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    symptom_logs = relationship("SymptomLog", back_populates="user", cascade="all, delete-orphan")
    nutrition_logs = relationship("NutritionLog", back_populates="user", cascade="all, delete-orphan")
    medication_logs = relationship("MedicationLog", back_populates="user", cascade="all, delete-orphan")
    lab_reports = relationship("LabReport", back_populates="user", cascade="all, delete-orphan")
    xray_reports = relationship("XrayReport", back_populates="user", cascade="all, delete-orphan")
    chat_history = relationship("ChatHistory", back_populates="user", cascade="all, delete-orphan")
