from fastapi import APIRouter, HTTPException, Depends, status
from datetime import datetime
from typing import List, Optional
from ..database import db
from ..models import IssueCreate, IssueUpdate, IssueResponse
from ..services.ai_service import ai_service
from .auth import get_current_user, get_admin_user

router = APIRouter(prefix="/issues", tags=["issues"])

@router.post("/", response_model=IssueResponse)
async def create_issue(issue_in: IssueCreate, current_user: dict = Depends(get_current_user)):
    # Run simulated AI scan
    ai_result = ai_service.analyze_issue(issue_in.category, issue_in.description)
    
    issue_dict = {
        "category": issue_in.category,
        "description": issue_in.description,
        "image_url": issue_in.image_url,
        "location": issue_in.location,
        "status": "submitted",
        "priority": ai_result["priority"],
        "ai_confidence": ai_result["confidence"],
        "createdAt": datetime.utcnow().isoformat() + "Z",
        "reported_by": current_user["email"]
    }
    
    created = await db.insert_one("issues", issue_dict)
    
    # Broadcast notification
    notification_msg = f"New {issue_in.category.upper()} reported at {issue_in.location.get('zone', 'Unknown Zone')} (AI Confidence: {ai_result['confidence']}%)"
    await db.insert_one("notifications", {
        "message": notification_msg,
        "type": "issue",
        "createdAt": datetime.utcnow().isoformat() + "Z"
    })
    
    return created

@router.get("/", response_model=List[IssueResponse])
async def list_issues(category: Optional[str] = None, status: Optional[str] = None):
    query = {}
    if category:
        query["category"] = category
    if status:
        query["status"] = status
        
    results = await db.find_many("issues", query, sort=[("createdAt", -1)])
    return results

@router.get("/{issue_id}", response_model=IssueResponse)
async def get_issue(issue_id: str):
    issue = await db.find_one("issues", {"id": issue_id})
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    return issue

@router.put("/{issue_id}", response_model=IssueResponse)
async def update_issue(issue_id: str, issue_update: IssueUpdate, current_user: dict = Depends(get_current_user)):
    issue = await db.find_one("issues", {"id": issue_id})
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
        
    update_data = {}
    if issue_update.status:
        update_data["status"] = issue_update.status
    if issue_update.priority:
        update_data["priority"] = issue_update.priority

    if not update_data:
        return issue

    await db.update_one("issues", {"id": issue_id}, {"$set": update_data})
    updated_issue = await db.find_one("issues", {"id": issue_id})
    
    # Send resolution notifications if appropriate
    if issue_update.status == "resolved":
        notification_msg = f"Civic Issue #{issue_id[:6]} ({issue.get('category').upper()}) has been RESOLVED at {issue.get('location', {}).get('zone', 'Zone')}"
        await db.insert_one("notifications", {
            "message": notification_msg,
            "type": "resolution",
            "createdAt": datetime.utcnow().isoformat() + "Z"
        })
        
    return updated_issue

@router.delete("/{issue_id}")
async def delete_issue(issue_id: str, current_user: dict = Depends(get_admin_user)):
    deleted = await db.delete_one("issues", {"id": issue_id})
    if not deleted:
        raise HTTPException(status_code=404, detail="Issue not found")
    return {"message": "Issue deleted successfully"}
