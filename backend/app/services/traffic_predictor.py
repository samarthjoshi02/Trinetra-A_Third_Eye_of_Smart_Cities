import re
from typing import Dict, Any

class TrafficPredictorService:
    @staticmethod
    def predict_congestion(area: str, time_str: str, weather: str) -> Dict[str, Any]:
        """
        Predicts traffic congestion levels, risk scores, and routes.
        Formula mixes time of day, weather severity, and zone traffic index.
        """
        # Parse time (expected HH:MM)
        hour = 12
        try:
            time_match = re.search(r"(\d{2}):(\d{2})", time_str)
            if time_match:
                hour = int(time_match.group(1))
        except Exception:
            pass

        # Identify rush hours: Morning (8-11 AM) and Evening (5-9 PM)
        is_rush_hour = (8 <= hour <= 11) or (17 <= hour <= 21)
        is_night = (23 <= hour <= 5)
        
        # Weather impact multipliers
        weather_lower = weather.lower()
        weather_multiplier = 1.0
        if weather_lower == "rainy":
            weather_multiplier = 1.4
        elif weather_lower == "foggy":
            weather_multiplier = 1.5
        elif weather_lower == "snowy":
            weather_multiplier = 1.8
            
        # Area base congestion index (0 to 40)
        area_hash = sum(ord(c) for c in area) % 40
        
        # Calculate risk score (0 - 100)
        base_risk = 20 + area_hash
        if is_rush_hour:
            base_risk += 35
        elif is_night:
            base_risk -= 10
            
        risk_score = min(max(int(base_risk * weather_multiplier), 5), 98)
        
        # Determine congestion level
        if risk_score >= 70:
            congestion = "High"
        elif risk_score >= 40:
            congestion = "Medium"
        else:
            congestion = "Low"

        # Alternate route suggestion based on the zone
        alternate_routes = {
            "connaught place": "Outer Ring Road via Barakhamba",
            "indiranagar": "100 Feet Road Bypass via HAL road",
            "bandra kurla complex": "Western Express Highway to Santacruz Link Road",
            "hitech city": "Kondapur road via Gachibowli flyover",
            "salt lake": "EM Bypass to Salt Lake Sector V flyover",
            "t nagar": "Kodambakkam High Road via GN Chetty Flyover"
        }
        
        area_key = area.lower().strip()
        matched_route = "Service Road / Alternate arterial grid route"
        for key in alternate_routes:
            if key in area_key:
                matched_route = alternate_routes[key]
                break
                
        return {
            "area": area,
            "congestion": congestion,
            "risk_score": risk_score,
            "alternate_route": matched_route
        }

traffic_predictor = TrafficPredictorService()
