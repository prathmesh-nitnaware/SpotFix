from processors.image_processor import verify_image_evidence
from processors.duplicate_detector import get_image_hash, check_for_duplicates
from processors.time_classifier import predict_resolution_time
import re

def analyze_issue(text: str, image_url: str = None, category: str = "General", active_reports: list = []):
    """
    The Architects' Core: Duplicate Check -> Text Analysis -> Visual Fusion -> Predictive Timing.
    """
    text_lower = text.lower()
    
    # 1. DUPLICATE DETECTION (Visual Fingerprinting)
    # Prevents redundant tickets from flooding the Admin Command Center
    new_hash = None
    if image_url:
        new_hash = get_image_hash(image_url)
        # Compares fingerprint against existing unresolved issues in Scalable DB
        duplicate_id = check_for_duplicates(new_hash, active_reports)
        if duplicate_id:
            return {
                "is_duplicate": True,
                "duplicate_issue_id": duplicate_id,
                "status": "Duplicate Detected via Image Hash"
            }

    # 2. ML PRIORITY CLASSIFIER (Textual Analysis)
    # Targeting "Emergency SOS" signals like sparks or floods
    initial_priority = "Low"
    high_signals = [r'fire', r'spark', r'shock', r'flood', r'sos', r'emergency', r'dangerous']
    med_signals = [r'broken', r'not working', r'ac', r'leak', r'projector', r'elevator']

    if any(re.search(signal, text_lower) for signal in high_signals):
        initial_priority = "High"
    elif any(re.search(signal, text_lower) for signal in med_signals):
        initial_priority = "Medium"

    # 3. VISUAL VERIFICATION (Multi-modal Fusion)
    # Combines text and image evidence to prevent false reports
    verification = verify_image_evidence(image_url, category)
    
    # AI Logic: Confirm or Downgrade priority based on visual proof
    final_priority = initial_priority
    if initial_priority == "High" and not verification['verified']:
        final_priority = "Medium"  # Downgrade if SOS text lacks visual proof
    elif initial_priority == "Low" and verification['verified'] and verification['confidence'] > 0.9:
        final_priority = "Medium"  # Upgrade if vision detects significant physical damage

    # 4. REPORTING TIME CLASSIFIER (Predictive Logic)
    # Predicts fix duration based on category and AI-confirmed priority
    time_prediction = predict_resolution_time(category, final_priority)

    return {
        "is_duplicate": False,
        "priority": final_priority,
        "ai_verification": verification['verified'],
        "confidence": verification['confidence'],
        "estimated_resolution_time": time_prediction['display_time'], # Dynamic estimate for student records
        "predicted_hours": time_prediction['predicted_hours'],
        "image_hash": new_hash, # Stored in Scalable DB for future duplicate checks
        "status": "Verified by AI" if verification['verified'] else "Manual Review Required"
    }