from datetime import datetime

def predict_resolution_time(category, priority, historical_avg_data=None):
    """
    Predicts fix duration based on category and priority.
    """
    # 1. Base Resolution Windows (Architects Standard)
    base_times = {
        "Electrical": 4,   # 4 hours
        "Plumbing": 6,     # 6 hours
        "Furniture": 48,   # 2 days
        "IT/Projector": 2, # 2 hours
        "General": 24      # 1 day
    }

    # 2. Get base time for category or default to 24h
    base_h = base_times.get(category, 24)

    # 3. Apply Priority Multiplier
    # High priority items get accelerated timelines
    if priority == "High":
        predicted_h = max(1, base_h * 0.5)
    elif priority == "Low":
        predicted_h = base_h * 1.5
    else:
        predicted_h = base_h

    # 4. Integrate Historical Data (If available from Scalable DB)
    # If the database shows the staff is currently slower, we adjust the estimate
    if historical_avg_data and category in historical_avg_data:
        actual_avg = historical_avg_data[category]
        predicted_h = (predicted_h + actual_avg) / 2

    return {
        "predicted_hours": round(predicted_h, 1),
        "display_time": f"{round(predicted_h)} Hours",
        "confidence_score": 0.85
    }