from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from processors.priority_engine import analyze_issue

router = APIRouter()

from typing import Optional

class IssueInput(BaseModel):
    text: str
    image_url: Optional[str] = None

@router.post("/analyze-priority")
async def analyze_priority(data: IssueInput):
    """
    Analyzes issue description to determine ML Priority.
    """
    print(data)
    try:
        result = analyze_issue(data.text, data.image_url)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))