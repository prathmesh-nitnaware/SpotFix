import joblib
import os
import re
from processors.image_processor import verify_image_evidence
from processors.duplicate_detector import get_image_hash, check_for_duplicates
from processors.time_classifier import predict_resolution_time

# 1. Dynamic Path Resolution
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'priority_model.pkl')
VECTORIZER_PATH = os.path.join(BASE_DIR, 'models', 'vectorizer.pkl')

# 2. Advanced Intelligence Loading
try:
    # Loading the serialized Gradient Boosting model and TF-IDF vectorizer
    model = joblib.load(MODEL_PATH)
    vectorizer = joblib.load(VECTORIZER_PATH)
    print("Architect AI: Advanced Model & Vectorizer loaded successfully.")
except Exception as e:
    print(f"CRITICAL ERROR: Could not load AI models from /models/. Error: {e}")
    model = None
    vectorizer = None

def analyze_issue(text: str, image_url: str = None, category: str = "General", active_reports: list = []):
    """
    The Architects' Final Core: Duplicate Check -> ML Text Analysis -> Visual Fusion -> Predictive Timing.
    """
    
    # 3. DUPLICATE DETECTION (Visual Fingerprinting)
    # Uses pHash to ensure the Admin Dashboard isn't flooded with redundant issues
    new_hash = None
    if image_url:
        new_hash = get_image_hash(image_url)
        # Check against unresolved reports stored in your Scalable DB
        duplicate_id = check_for_duplicates(new_hash, active_reports)
        if duplicate_id:
            return {
                "is_duplicate": True,
                "duplicate_issue_id": duplicate_id,
                "status": "Duplicate Detected via Image Hash"
            }

    # 4. ML PRIORITY CLASSIFIER (Advanced Prediction)
    if model and vectorizer:
        # Transforming text into the exact numerical format the model was trained on
        X_text = vectorizer.transform([text])
        final_priority = model.predict(X_text)[0]
        
        # Calculate confidence score for the Admin Dashboard
        probs = model.predict_proba(X_text)
        confidence = float(max(probs[0]))
    else:
        # Emergency Fallback to keyword signals if model file is missing
        final_priority = "Medium"
        confidence = 0.5

    # 5. VISUAL VERIFICATION (Multi-modal Fusion)
    # Cross-references the predicted priority with visual evidence
    verification = verify_image_evidence(image_url, category)
    
    # AI Guard: Downgrade if 'High' priority text lacks visual verification
    if final_priority == "High" and not verification.get('verified', False):
        final_priority = "Medium"
        status_msg = "Priority Downgraded: Visual proof missing"
    elif verification.get('verified'):
        status_msg = "Verified by AI"
    else:
        status_msg = "Manual Review Required"

    # 6. REPORTING TIME CLASSIFIER (Predictive Logic)
    # Estimates resolution window based on the final AI-confirmed priority
    time_prediction = predict_resolution_time(category, final_priority)

    return {
        "is_duplicate": False,
        "priority": final_priority,
        "confidence": round(confidence, 2),
        "ai_verification": verification.get('verified', False),
        "estimated_resolution_time": time_prediction['display_time'],
        "predicted_hours": time_prediction['predicted_hours'],
        "image_hash": new_hash,
        "status": status_msg
    }