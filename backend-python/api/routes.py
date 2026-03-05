from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from processors.priority_engine import analyze_issue

router = APIRouter()

from typing import Optional, List, Dict, Any

class IssueInput(BaseModel):
    text: str
    image_url: Optional[str] = None
    category: Optional[str] = "General"
    active_reports: Optional[List[Dict[str, Any]]] = None

@router.post("/analyze-priority")
async def analyze_priority(data: IssueInput):
    """
    Analyzes issue description to determine ML Priority.
    """
    print(data)
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