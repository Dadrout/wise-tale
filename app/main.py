from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(
    title="WiseTale API",
    description="API for WiseTale educational platform",
    version="1.0.0"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Import and include API routers
from app.api.v1 import stories, users

app.include_router(stories.router, prefix="/api/v1/stories", tags=["stories"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"]) 