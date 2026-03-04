from fastapi import FastAPI
from api.routes import router
import uvicorn

app = FastAPI(title="SpotFix AI Engine", version="1.0.0")

# Include the routes from the api directory
app.include_router(router)

@app.get("/")
async def root():
    return {"message": "SpotFix AI Engine is Online", "status": "active"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)