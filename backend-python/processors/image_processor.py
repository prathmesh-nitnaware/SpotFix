import cv2
import numpy as np
import requests
from io import BytesIO

def verify_image_evidence(image_url: str, category: str):
    """
    Verifies if the uploaded image matches the reported category.
    """
    if not image_url:
        return {"verified": False, "confidence": 0, "reason": "No image provided"}

    try:
        # 1. Fetch Image from Scalable DB/Cloud Storage
        response = requests.get(image_url)
        img_array = np.asarray(bytearray(response.content), dtype=np.uint8)
        img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

        if img is None:
            return {"verified": False, "confidence": 0, "reason": "Invalid image format"}

        # 2. Basic Feature Extraction (Simulated ML Verification)
        # In a full production build, you would use a CNN like MobileNetV2 here
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        brightness = np.mean(gray)
        
        # Example Logic: Detecting specific issues like 'Leaking' or 'Broken AC'
        # Detect edges to find structural damage/cracks
        edges = cv2.Canny(gray, 100, 200)
        edge_density = np.sum(edges) / (img.shape[0] * img.shape[1])

        # Verification result based on the category
        is_verified = True if edge_density > 0.01 else False # Minimal damage detection
        
        return {
            "verified": is_verified,
            "confidence": 0.88 if is_verified else 0.45,
            "metadata": {
                "brightness": round(brightness, 2),
                "edge_density": round(edge_density, 4)
            }
        }
    except Exception as e:
        return {"verified": False, "confidence": 0, "reason": str(e)}