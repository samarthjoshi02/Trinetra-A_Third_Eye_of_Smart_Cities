from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

# ================= AUTHENTICATION SCHEMAS =================

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str = Field("citizen", description="Role can be 'citizen' or 'admin'")

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    name: str
    email: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# ================= CIVIC ISSUE SCHEMAS =================

class IssueCreate(BaseModel):
    category: str = Field(..., description="pothole, garbage, water, streetlight, road")
    description: str
    image_url: Optional[str] = None  # Base64 or standard url
    location: Dict[str, Any] = Field(..., description="{'lat': float, 'lng': float, 'zone': str}")

class IssueUpdate(BaseModel):
    status: Optional[str] = None  # submitted, under_review, in_progress, resolved
    priority: Optional[str] = None  # low, medium, high

class IssueResponse(BaseModel):
    id: str
    category: str
    description: str
    image_url: Optional[str] = None
    location: Dict[str, Any]
    status: str
    priority: str
    ai_confidence: Optional[float] = None
    createdAt: str

    class Config:
        from_attributes = True

# ================= EMERGENCY SCHEMAS =================

class EmergencyCreate(BaseModel):
    type: str = Field(..., description="medical, fire, accident, crime")
    location: Dict[str, Any] = Field(..., description="{'lat': float, 'lng': float, 'zone': str}")

class EmergencyUpdate(BaseModel):
    status: str  # pending, accepted, responding, resolved

class EmergencyResponse(BaseModel):
    id: str
    type: str
    location: Dict[str, Any]
    status: str
    createdAt: str
    resolvedAt: Optional[str] = None

    class Config:
        from_attributes = True

# ================= TRAFFIC SCHEMAS =================

class TrafficQuery(BaseModel):
    area: str
    time: str  # e.g. "09:00", "18:30", etc.
    weather: str  # sunny, rainy, foggy

class TrafficPredictionResponse(BaseModel):
    area: str
    congestion: str  # low, medium, high
    risk_score: int  # 0 to 100
    alternate_route: str

# ================= NOTIFICATION SCHEMAS =================

class NotificationResponse(BaseModel):
    id: str
    message: str
    type: str  # issue, emergency, resolution
    createdAt: str
