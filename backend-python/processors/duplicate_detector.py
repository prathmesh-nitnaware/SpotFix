import requests
from PIL import Image
import imagehash
from io import BytesIO

def get_image_hash(image_url: str):
    """
    Generates a perceptual hash (pHash) for an image.
    """
    if not image_url:
        return None
        
    try:
        # 1. Fetch from Cloud Storage/DB
        response = requests.get(image_url, timeout=5)
        img = Image.open(BytesIO(response.content))
        
        # 2. Generate Structural Fingerprint
        # pHash is robust to minor changes like compression or resizing
        return str(imagehash.phash(img))
    except Exception as e:
        print(f"Hashing error: {e}")
        return None

def check_for_duplicates(new_hash: str, existing_hashes: list, threshold: int = 5):
    """
    Compares the new hash against a list of hashes from unresolved reports.
    A threshold of 5 or less usually indicates a near-identical image.
    """
    if not new_hash or not existing_hashes:
        return None

    for entry in existing_hashes:
        # 3. Calculate Hamming distance for visual similarity
        try:
            distance = imagehash.hex_to_hash(new_hash) - imagehash.hex_to_hash(entry['hash'])
            if distance <= threshold:
                return entry['issue_id'] # Duplicate found!
        except Exception:
            continue
            
    return None