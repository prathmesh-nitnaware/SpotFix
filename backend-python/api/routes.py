from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from processors.priority_engine import analyze_issue

router = APIRouter()

# --------- MODELS ---------

class IssueInput(BaseModel):
    text: str
    image_url: Optional[str] = None
    category: Optional[str] = "General"
    active_reports: Optional[List[Dict[str, Any]]] = None

class IssueBatch(BaseModel):
    issues: List[Dict[str, Any]]

# --------- EXISTING PRIORITY ANALYSIS ---------

@router.post("/analyze-priority")
async def analyze_priority(data: IssueInput):
    try:
        result = analyze_issue(
            text=data.text,
            image_url=data.image_url,
            category=data.category,
            active_reports=data.active_reports
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --------- AI PRIORITIZE (Admin Dashboard Button) ---------

@router.post("/ai-prioritize")
async def ai_prioritize(data: IssueBatch):
    """
    Re-ranks open issues using the ML priority model.
    """
    try:
        ranked = []

        for issue in data.issues:
            result = analyze_issue(
                text=issue.get("description", ""),
                image_url=issue.get("imageUrl"),
                category=issue.get("category", "General"),
                active_reports=[]
            )

            ranked.append({
                "id": issue.get("_id"),
                "title": issue.get("title"),
                "priority": result.get("priority"),
                "confidence": result.get("confidence"),
                "location": issue.get("location"),
            })

        ranked_sorted = sorted(
            ranked,
            key=lambda x: {"High":3,"Medium":2,"Low":1}.get(x["priority"],1),
            reverse=True
        )

        return {
            "ranked_issues": ranked_sorted
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --------- DAILY SUMMARY ---------

@router.post("/summarize-today")
async def summarize_today(data: IssueBatch):
    """
    Generates a quick structural summary of today's issues.
    """
    try:
        issues = data.issues

        total = len(issues)
        categories = {}

        for i in issues:
            cat = i.get("category", "General")
            categories[cat] = categories.get(cat, 0) + 1

        top_category = max(categories, key=categories.get) if categories else "None"

        summary = f"""
Today's campus report summary:

Total new issues: {total}

Most common category: {top_category}

Category distribution:
{categories}

Recommendation:
Focus maintenance teams on {top_category} areas first.
"""

        return {"summary": summary.strip()}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --------- PATTERN DETECTION ---------

@router.post("/detect-patterns")
async def detect_patterns(data: IssueBatch):
    """
    Detects recurring campus problems.
    """
    try:
        issues = data.issues

        patterns = {}

        for issue in issues:
            key = f"{issue.get('category','General')} - {issue.get('location',{}).get('building','Unknown')}"
            patterns[key] = patterns.get(key, 0) + 1

        recurring = [
            {"pattern": k, "count": v}
            for k, v in patterns.items()
            if v > 2
        ]

        return {
            "patterns": recurring
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))