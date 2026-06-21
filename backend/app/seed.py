import asyncio
from datetime import datetime, timedelta
from .database import db
# pyrefly: ignore [missing-import]
import bcrypt

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

# Indian city zones used for seeding
ZONES = [
    {"name": "Connaught Place, Delhi", "lat": 28.6304, "lng": 77.2177},
    {"name": "Indiranagar, Bengaluru", "lat": 12.9719, "lng": 77.6412},
    {"name": "Bandra Kurla Complex, Mumbai", "lat": 19.0607, "lng": 72.8633},
    {"name": "Hitech City, Hyderabad", "lat": 17.4483, "lng": 78.3741},
    {"name": "Salt Lake, Kolkata", "lat": 22.5802, "lng": 88.4273},
    {"name": "T Nagar, Chennai", "lat": 13.0405, "lng": 80.2337}
]

async def seed_database():
    # Check if database is already seeded
    user_count = await db.count("users")
    if user_count > 0:
        print("Database already seeded.")
        return

    print("Seeding database...")
    now = datetime.utcnow()

    # 1. Seed Users
    users = [
        {
            "name": "Command Director",
            "email": "admin@trinetra.gov.in",
            "password_hash": get_password_hash("admin123"),
            "role": "admin"
        },
        {
            "name": "Rajesh Kumar",
            "email": "citizen@trinetra.gov.in",
            "password_hash": get_password_hash("citizen123"),
            "role": "citizen"
        }
    ]
    for u in users:
        await db.insert_one("users", u)

    # 2. Seed Civic Issues (20 complaints)
    categories = ["pothole", "garbage", "water", "streetlight", "road"]
    status_choices = ["submitted", "under_review", "in_progress", "resolved"]
    priority_choices = ["low", "medium", "high"]
    
    issue_descriptions = {
        "pothole": [
            "Severe pothole on main arterial junction causing gridlock.",
            "Deep structural depression in road pavement dangerous for motorists.",
            "Multiple waterlogged potholes near residential zone corner.",
            "Massive asphalt erosion after heavy pre-monsoon shower."
        ],
        "garbage": [
            "Industrial waste dumped on pedestrian walkway.",
            "Municipal waste bins overflowing with plastic litter.",
            "Illegal trash burning near public park boundaries.",
            "Debris and waste piles blocking local storm water drains."
        ],
        "water": [
            "High pressure water line burst flooding the access lane.",
            "Municipal supply water pipeline leaking clear drinking water.",
            "Sewage line overflow mixing with rainwater runoff on streets.",
            "Low water pressure coupled with rust discoloration reported."
        ],
        "streetlight": [
            "Complete grid of five streetlights non-operational on main street.",
            "Streetlight flickering rapidly causing visibility issues.",
            "Damaged poles following windstorm leaving section in darkness.",
            "Solar smart streetlight bulb burnt out near metro exit gate."
        ],
        "road": [
            "Pavement side curbs broken and displaced onto driving path.",
            "Road divider structure shattered due to vehicular collision.",
            "Unfinished road repair work left without reflector safety blocks.",
            "Speed breaker markers completely faded and invisible at night."
        ]
    }

    # Generate 20 structured issues
    for i in range(20):
        category = categories[i % len(categories)]
        desc_list = issue_descriptions[category]
        desc = desc_list[i % len(desc_list)]
        zone = ZONES[i % len(ZONES)]
        
        # Add slight offsets to coordinates to separate markers on map
        lat_offset = (i * 0.0017) - 0.017
        lng_offset = (i * -0.0015) + 0.015
        
        status = status_choices[i % len(status_choices)]
        priority = priority_choices[i % len(priority_choices)]
        # Force high priority for water leakage and potholes
        if category in ["water", "pothole"]:
            priority = "high"
        
        created_time = now - timedelta(days=(20 - i), hours=(i * 2))
        resolved_time = created_time + timedelta(hours=8, minutes=45) if status == "resolved" else None
        
        issue = {
            "category": category,
            "description": desc,
            "image_url": f"https://images.unsplash.com/photo-{(1580000000000 + i)}?q=80&w=400", # Placeholder mock URL, frontend overrides if needed
            "location": {
                "lat": round(zone["lat"] + lat_offset, 5),
                "lng": round(zone["lng"] + lng_offset, 5),
                "zone": zone["name"]
            },
            "status": status,
            "priority": priority,
            "ai_confidence": round(89.5 + (i * 0.4), 1),
            "createdAt": created_time.isoformat() + "Z",
            "resolvedAt": resolved_time.isoformat() + "Z" if resolved_time else None,
            "reported_by": "citizen@trinetra.gov.in"
        }
        await db.insert_one("issues", issue)

    # 3. Seed Emergencies (10 SOS incidents)
    emergency_types = ["medical", "fire", "accident", "crime"]
    emergency_descs = {
        "medical": "Cardiac arrest patient needing urgent ambulance support.",
        "fire": "Transformer fire spreading to commercial retail store.",
        "accident": "Multi-car collision on flyover blocking central lanes.",
        "crime": "Active store theft and civil disturbance reported."
    }

    for i in range(10):
        etype = emergency_types[i % len(emergency_types)]
        zone = ZONES[(i + 2) % len(ZONES)]
        
        lat_offset = (i * -0.0013) + 0.011
        lng_offset = (i * 0.0019) - 0.013
        
        # 3 resolved, 2 responding, 3 accepted, 2 pending
        if i in [0, 4, 8]:
            status = "resolved"
        elif i in [1, 5]:
            status = "responding"
        elif i in [2, 6]:
            status = "accepted"
        else:
            status = "pending"
            
        created_time = now - timedelta(hours=(10 - i), minutes=(i * 12))
        resolved_time = created_time + timedelta(minutes=24) if status == "resolved" else None
        
        emergency = {
            "type": etype,
            "location": {
                "lat": round(zone["lat"] + lat_offset, 5),
                "lng": round(zone["lng"] + lng_offset, 5),
                "zone": zone["name"]
            },
            "status": status,
            "createdAt": created_time.isoformat() + "Z",
            "resolvedAt": resolved_time.isoformat() + "Z" if resolved_time else None,
            "activated_by": "citizen@trinetra.gov.in"
        }
        await db.insert_one("emergencies", emergency)

    # 4. Seed Traffic reports (15 reports)
    congestion_choices = ["Low", "Medium", "High"]
    weather_choices = ["sunny", "rainy", "foggy"]
    
    traffic_routes = [
        ("Connaught Place Outer Circle", "Bypass Ring Road", "sunny"),
        ("Indiranagar 100 Feet Road", "HAL road bypass", "rainy"),
        ("BKC G-Block Highway", "SCLR expressway", "foggy"),
        ("Hitech City Flyover", "Kondapur Bypass Route", "sunny"),
        ("EM Bypass Salt Lake", "Sector V arterial roads", "rainy"),
        ("T Nagar flyover junction", "Kodambakkam arterial grid", "sunny")
    ]
    
    for i in range(15):
        route_info = traffic_routes[i % len(traffic_routes)]
        congestion = congestion_choices[i % len(congestion_choices)]
        
        # Calculate mock risk score
        risk = 25
        if congestion == "High":
            risk = 82 + (i % 10)
        elif congestion == "Medium":
            risk = 52 + (i % 10)
        else:
            risk = 15 + (i % 10)

        traffic = {
            "area": route_info[0],
            "congestion": congestion,
            "risk_score": risk,
            "alternate_route": route_info[1],
            "weather": route_info[2],
            "time": f"{8 + (i % 12):02d}:{i * 4 % 60:02d}"
        }
        await db.insert_one("traffic", traffic)

    # 5. Seed System Notifications (8 alerts)
    notifications = [
        {"message": "CRITICAL SOS: MEDICAL emergency reported in BKC, Mumbai.", "type": "emergency"},
        {"message": "New POTHOLE reported in Connaught Place, Delhi (AI Confidence: 94.6%).", "type": "issue"},
        {"message": "Civic Issue #29841 (GARBAGE OVERFLOW) resolved in Salt Lake, Kolkata.", "type": "resolution"},
        {"message": "CRITICAL SOS: FIRE hazard reported at metro terminal, T Nagar.", "type": "emergency"},
        {"message": "New WATER LEAKAGE reported in Indiranagar, Bengaluru (AI Confidence: 92.1%).", "type": "issue"},
        {"message": "Civic Issue #12895 (BROKEN STREETLIGHT) resolved in Hitech City.", "type": "resolution"},
        {"message": "CRITICAL SOS: ACCIDENT crash on BKC flyover junction.", "type": "emergency"},
        {"message": "New ROAD DAMAGE reported in Salt Lake, Kolkata (AI Confidence: 90.3%).", "type": "issue"}
    ]
    
    for idx, notif in enumerate(notifications):
        notif["createdAt"] = (now - timedelta(minutes=(idx * 15))).isoformat() + "Z"
        await db.insert_one("notifications", notif)

    print("Database seeding completed successfully.")
