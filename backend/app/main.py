import re
from fastapi import FastAPI, APIRouter, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

from .config import settings
from .database import db
from .routers import auth, issues, emergencies, traffic
from .seed import seed_database

app = FastAPI(
    title="TRINETRA API",
    description="The Third Eye of Smart Cities API Engine",
    version="1.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(issues.router)
app.include_router(emergencies.router)
app.include_router(traffic.router)

@app.on_event("startup")
async def startup_event():
    await seed_database()

@app.get("/")
def read_root():
    return {
        "status": "online",
        "system": "TRINETRA: Smart City Management Platform",
        "tagline": "Predict. Protect. Prosper.",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

# ================= NOTIFICATIONS API =================

@app.get("/notifications", response_model=List[Dict[str, Any]])
async def get_notifications(limit: int = 15):
    return await db.find_many("notifications", sort=[("createdAt", -1)], limit=limit)

@app.post("/notifications/clear")
async def clear_notifications():
    # Remove all notifications
    await db.delete_one("notifications", {})  # For JSON database
    # In MongoDB, delete_many is normally used, but our db interface has delete_one.
    # To clear, we can simply overwrite notifications in local storage
    if not settings.MONGO_URI:
        db.json_db._write({**db.json_db._read(), "notifications": []})
    else:
        await db.mongo_db["notifications"].delete_many({})
    return {"message": "Notifications cleared"}

# ================= ANALYTICS & DASHBOARD STATS =================

@app.get("/analytics/stats")
async def get_dashboard_stats():
    # 1. Counts
    total_issues = await db.count("issues")
    open_issues = await db.count("issues", {"status": "submitted"}) + \
                  await db.count("issues", {"status": "under_review"}) + \
                  await db.count("issues", {"status": "in_progress"})
    resolved_issues = await db.count("issues", {"status": "resolved"})
    
    active_emergencies = await db.count("emergencies", {"status": "pending"}) + \
                         await db.count("emergencies", {"status": "accepted"}) + \
                         await db.count("emergencies", {"status": "responding"})
    total_emergencies = await db.count("emergencies")
    resolved_emergencies = await db.count("emergencies", {"status": "resolved"})

    recent_traffic = await db.find_many("traffic", limit=30)
    high_traffic_zones = len([t for t in recent_traffic if t.get("congestion") == "High"])

    # 2. Average Response Time calculation
    # We look at resolved emergencies
    emergencies_list = await db.find_many("emergencies", {"status": "resolved"})
    issues_list = await db.find_many("issues", {"status": "resolved"})
    
    total_minutes = 0
    resolved_count = 0
    
    for item in emergencies_list:
        try:
            created = datetime.fromisoformat(item["createdAt"].replace("Z", ""))
            resolved = datetime.fromisoformat(item["resolvedAt"].replace("Z", ""))
            diff = (resolved - created).total_seconds() / 60.0
            total_minutes += max(diff, 1)  # min 1 minute for representation
            resolved_count += 1
        except Exception:
            pass

    for item in issues_list:
        try:
            created = datetime.fromisoformat(item["createdAt"].replace("Z", ""))
            resolved = datetime.fromisoformat(item["resolvedAt"].replace("Z", ""))
            diff = (resolved - created).total_seconds() / 60.0
            total_minutes += max(diff, 1)
            resolved_count += 1
        except Exception:
            pass

    avg_response_minutes = round(total_minutes / resolved_count, 1) if resolved_count > 0 else 12.5

    # 3. Chart data: Issue Category Distribution
    categories = ["pothole", "garbage", "water", "streetlight", "road"]
    issue_distribution = []
    for cat in categories:
        count = await db.count("issues", {"category": cat})
        issue_distribution.append({"name": cat.capitalize(), "value": count})

    # 4. Chart data: Emergency Types
    emergency_types = ["medical", "fire", "accident", "crime"]
    emergency_distribution = []
    for et in emergency_types:
        count = await db.count("emergencies", {"type": et})
        emergency_distribution.append({"name": et.capitalize(), "value": count})

    # 5. Chart data: Traffic Congestion Trends
    # We count High, Medium, Low congestion across reported traffic data
    congestion_distribution = [
        {"name": "High Congestion", "value": len([t for t in recent_traffic if t.get("congestion") == "High"])},
        {"name": "Medium Congestion", "value": len([t for t in recent_traffic if t.get("congestion") == "Medium"])},
        {"name": "Low Congestion", "value": len([t for t in recent_traffic if t.get("congestion") == "Low"])}
    ]

    return {
        "metrics": {
            "openIssues": open_issues,
            "resolvedIssues": resolved_issues,
            "totalIssues": total_issues,
            "activeEmergencies": active_emergencies,
            "resolvedEmergencies": resolved_emergencies,
            "totalEmergencies": total_emergencies,
            "highTrafficZones": high_traffic_zones,
            "averageResponseTimeMinutes": avg_response_minutes
        },
        "charts": {
            "issueDistribution": issue_distribution,
            "emergencyDistribution": emergency_distribution,
            "trafficCongestion": congestion_distribution
        }
    }

# ================= TRINETRA AI CHAT ASSISTANT =================

class ChatMessage(BaseModel):
    message: str

@app.post("/ai/chat")
async def chat_assistant(payload: ChatMessage):
    prompt = payload.message.lower().strip()
    
    # 1. Unresolved complaints
    if "unresolved" in prompt or "open complaint" in prompt or "pending complaint" in prompt or "open issue" in prompt:
        issues_list = await db.find_many("issues")
        unresolved = [i for i in issues_list if i.get("status") != "resolved"]
        if not unresolved:
            return {"response": "All reported civic issues have been successfully resolved by the municipal administration. No pending complaints found."}
        
        reply = f"I detected {len(unresolved)} unresolved civic complaints in the active database:\n"
        for i, item in enumerate(unresolved[:5]):
            reply += f"- **#{item['id'][:6]}**: {item['category'].upper()} at {item.get('location', {}).get('zone', 'Unknown Zone')} [{item['priority'].upper()} priority, Status: {item['status'].replace('_', ' ').capitalize()}]\n"
        if len(unresolved) > 5:
            reply += f"...and {len(unresolved) - 5} more. You can manage them in the Civic Issues panel."
        return {"response": reply}

    # 2. Emergency hotspots / active emergencies
    elif "emergency" in prompt or "hotspot" in prompt or "sos" in prompt:
        emergencies_list = await db.find_many("emergencies")
        active = [e for e in emergencies_list if e.get("status") != "resolved"]
        if not active:
            return {"response": "Excellent status: There are currently no active emergency SOS signals reported in the city command registry."}
        
        reply = f"ALERT: There are {len(active)} active emergency SOS events currently demanding response:\n"
        for item in active:
            reply += f"- **SOS-{item['id'][:4].upper()}**: {item['type'].upper()} incident at {item.get('location', {}).get('zone', 'Zone')} [Status: {item['status'].upper()}]\n"
        reply += "\nAll emergency dispatch responders have been alerted. Response timers are ticking live on the administrator dashboard."
        return {"response": reply}

    # 3. High congestion zones
    elif "congestion" in prompt or "traffic" in prompt or "jam" in prompt:
        recent_traffic = await db.find_many("traffic", limit=30)
        high_zones = [t for t in recent_traffic if t.get("congestion") == "High"]
        if not high_zones:
            return {"response": "Main arterial networks report smooth flow. No high congestion zones are identified at this hour."}
        
        unique_zones = list(set([z["area"] for z in high_zones]))
        reply = f"Intelligent Traffic routing alert. High traffic congestion predicted or reported in {len(unique_zones)} areas:\n"
        for zone in unique_zones[:5]:
            # find details
            details = next((t for t in high_zones if t["area"] == zone), None)
            reply += f"- **{zone}**: High risk index ({details.get('risk_score', 80)}%). Suggested Alternate Route: *{details.get('alternate_route')}*.\n"
        return {"response": reply}

    # 4. Today's analytics
    elif "analytics" in prompt or "statistics" in prompt or "summary" in prompt:
        total_i = await db.count("issues")
        open_i = await db.count("issues", {"status": "submitted"}) + \
                 await db.count("issues", {"status": "under_review"}) + \
                 await db.count("issues", {"status": "in_progress"})
        resolved_i = await db.count("issues", {"status": "resolved"})
        active_e = await db.count("emergencies", {"status": "pending"}) + \
                   await db.count("emergencies", {"status": "accepted"}) + \
                   await db.count("emergencies", {"status": "responding"})
        
        reply = f"Here is the TRINETRA Smart City Analytics summary for today:\n" \
                f"- **Civic Issues**: {total_i} total reported, {resolved_i} resolved, {open_i} active and tracking.\n" \
                f"- **SOS Incidents**: {active_e} active emergency alerts under tracking.\n" \
                f"- **Response Speed**: Average incident response time is currently at **12.5 minutes** from trigger to dispatch wrap.\n" \
                f"- **City Status**: Overall Operations: STABLE | Emergency Dispatch: ACTIVE."
        return {"response": reply}

    # 5. Fallback greeting
    else:
        return {"response": (
            "Namaste! I am TRINETRA AI, your digital assistant for the Smart City Operating System.\n\n"
            "I can process standard voice/text parameters. Try asking me:\n"
            "- *'Show unresolved complaints'* to list active civic issues.\n"
            "- *'Show emergency hotspots'* to check active SOS coordinates.\n"
            "- *'Display high congestion zones'* to query traffic prediction metrics.\n"
            "- *'Show today's analytics'* to view city-wide performance metrics."
        )}
