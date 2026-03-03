from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class AnalysisRequest(BaseModel):
    text: str

@app.post("/analyze-priority")
async def analyze_priority(request: AnalysisRequest):
    desc = request.text.lower()
    # Basic logic: can be replaced with trained model later
    high_risk = ['fire', 'spark', 'shock', 'flood', 'emergency', 'hurt']
    
    priority = "Low"
    if any(word in desc for word in high_risk):
        priority = "High"
    elif len(desc) > 30:
        priority = "Medium"
        
    return {"priority": priority}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 