import random
from typing import Dict, Any

class AISimulationService:
    @staticmethod
    def analyze_issue(category: str, description: str) -> Dict[str, Any]:
        """
        Simulates AI inference for civic issue detection.
        Assigns priority levels and classification confidence based on category and details.
        """
        # Base confidence between 88% and 98%
        confidence = round(random.uniform(88.5, 98.2), 1)
        
        # Categorized priority mapping
        category_lower = category.lower()
        if "water" in category_lower or "leak" in category_lower:
            priority = "high"
        elif "pothole" in category_lower or "road" in category_lower:
            # Pothole issues can be medium or high depending on description
            if "deep" in description.lower() or "accident" in description.lower() or "highway" in description.lower():
                priority = "high"
            else:
                priority = "medium"
        elif "garbage" in category_lower or "waste" in category_lower:
            priority = "medium"
        elif "streetlight" in category_lower or "light" in category_lower:
            priority = "low"
        else:
            priority = "medium"

        return {
            "detected_category": category,
            "confidence": confidence,
            "priority": priority
        }

ai_service = AISimulationService()
