from fastapi import APIRouter, HTTPException, Depends, status
from datetime import datetime
from typing import List, Optional
from ..database import db
from ..models import EmergencyCreate, EmergencyUpdate, EmergencyResponse
from .auth import get_current_user, get_admin_user

router = APIRouter(prefix="/emergencies", tags=["emergencies"])

@router.post("/", response_model=EmergencyResponse)
async def trigger_emergency(emergency_in: EmergencyCreate, current_user: dict = Depends(get_current_user)):
    emergency_dict = {
        "type": emergency_in.type,
        "location": emergency_in.location,
        "status": "pending",
        "createdAt": datetime.utcnow().isoformat() + "Z",
        "resolvedAt": None,
        "activated_by": current_user["email"]
    }
    
    created = await db.insert_one("emergencies", emergency_dict)
    
    # Send high-priority notification
    notification_msg = f"CRITICAL SOS: {emergency_in.type.upper()} reported at {emergency_in.location.get('zone', 'Unknown Zone')}! Instant mobilization required."
    await db.insert_one("notifications", {
        "message": notification_msg,
        "type": "emergency",
        "createdAt": datetime.utcnow().isoformat() + "Z"
    })
    
    return created

@router.get("/", response_model=List[EmergencyResponse])
async def list_emergencies(status: Optional[str] = None):
    query = {}
    if status:
        query["status"] = status
        
    results = await db.find_many("emergencies", query, sort=[("createdAt", -1)])
    return results

@router.get("/{emergency_id}", response_model=EmergencyResponse)
async def get_emergency(emergency_id: str):
    emergency = await db.find_one("emergencies", {"id": emergency_id})
    if not emergency:
        raise HTTPException(status_code=404, detail="Emergency not found")
    return emergency

@router.put("/{emergency_id}", response_model=EmergencyResponse)
async def update_emergency(emergency_id: str, emergency_update: EmergencyUpdate, current_user: dict = Depends(get_current_user)):
    emergency = await db.find_one("emergencies", {"id": emergency_id})
    if not emergency:
        raise HTTPException(status_code=404, detail="Emergency not found")
        
    update_data = {
        "status": emergency_update.status
    }
    
    if emergency_update.status == "resolved":
        update_data["resolvedAt"] = datetime.utcnow().isoformat() + "Z"
        
    await db.update_one("emergencies", {"id": emergency_id}, {"$set": update_data})
    updated = await db.find_one("emergencies", {"id": emergency_id})
    
    # Send resolution notification
    if emergency_update.status == "resolved":
        notification_msg = f"Emergency Alert #{emergency_id[:6]} ({emergency.get('type').upper()}) resolved. Response operations completed."
        await db.insert_one("notifications", {
            "message": notification_msg,
            "type": "resolution",
            "createdAt": datetime.utcnow().isoformat() + "Z"
        })
        
    return updated

@router.delete("/{emergency_id}")
async def delete_emergency(emergency_id: str, current_user: dict = Depends(get_admin_user)):
    deleted = await db.delete_one("emergencies", {"id": emergency_id})
    if not deleted:
        raise HTTPException(status_code=404, detail="Emergency not found")
    return {"message": "Emergency deleted successfully"}
