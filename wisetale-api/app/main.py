# app/main.py
from fastapi import FastAPI
from app.api.v1.stories import router as stories_router
from app.api.v1.users import router as users_router
from app.api.v1.videos import router as videos_router
from app.api.v1.audio import router as audio_router
from app.api.v1.generate import router as generate_router
from app.api.v1.waitlist import router as waitlist_router

app = FastAPI()

app.include_router(stories_router)
app.include_router(users_router)
app.include_router(videos_router)
app.include_router(audio_router)
app.include_router(generate_router)
app.include_router(waitlist_router)

@app.get("/")
def read_root():
    return {"message": "Hello, WiseTale API is running!"}
