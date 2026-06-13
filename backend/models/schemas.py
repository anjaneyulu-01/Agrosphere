from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List


class SignupRequest(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr


class AuthResponse(BaseModel):
    token: str
    user: UserResponse


class ChatRequest(BaseModel):
    message: str
    language: str = "en"
    history: Optional[List[dict]] = []


class ChatResponse(BaseModel):
    reply: str
    language: str
    source: str = "Gemini AI"


class WeatherRequest(BaseModel):
    lat: float
    lon: float
    crop: Optional[str] = None


class SoilRequest(BaseModel):
    nitrogen: float
    phosphorus: float
    potassium: float
    ph: float
    organic_carbon: float
    moisture: Optional[float] = None


class YieldRequest(BaseModel):
    crop: str
    state: str
    district: str
    season: str
    area_acres: float
    soil_type: str
    irrigation_type: str
    fertilizer_kg_per_acre: float


class IrrigationRequest(BaseModel):
    crop: str
    soil_type: str
    area_acres: float
    soil_moisture_pct: float
    last_irrigation_date: str


class LivestockRequest(BaseModel):
    animal_type: str
    symptoms: List[str]
    age_years: Optional[float] = None
    breed: Optional[str] = None


class SchemeRequest(BaseModel):
    state: str
    farmer_type: str
    crop: str
    land_size_acres: float
    annual_income: float
    category: str


class InsuranceRequest(BaseModel):
    insurance_type: str
    crop: str
    damage_percentage: float
    damage_cause: str
    area_affected_acres: float


class FertilizerRequest(BaseModel):
    crop: str
    soil_type: str
    nitrogen: float
    phosphorus: float
    potassium: float
    ph: float
    area_acres: float
