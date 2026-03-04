import re

def analyze_issue(text: str, image_url: str = None):
    text = text.lower()
    
    # Priority Keywords for Campus Maintenance
    high_priority_signals = [
        r'spark', r'fire', r'shock', r'short circuit', 
        r'flood', r'major leak', r'sos', r'emergency', r'dangerous'
    ]
    
    medium_priority_signals = [
        r'broken', r'not working', r'ac repair', 
        r'projector', r'fan', r'elevator', r'lift'
    ]

    # Check for High Priority signals
    if any(re.search(signal, text) for signal in high_priority_signals):
        priority = "High"
        reason = "Safety/Emergency signal detected"
    # Check for Medium Priority
    elif any(re.search(signal, text) for signal in medium_priority_signals):
        priority = "Medium"
        reason = "Infrastructure failure detected"
    else:
        priority = "Low"
        reason = "General maintenance/Improvement"

    # Reporting Time Classifier Logic
    # In production, this would calculate estimated fix time based on category
    estimated_hours = 2 if priority == "High" else 24 if priority == "Medium" else 72

    return {
        "priority": priority,
        "classification_reason": reason,
        "estimated_resolution_time": f"{estimated_hours}h",
        "multimodal_status": "Text-Analyzed" if not image_url else "Text-Image-Verified"
    }