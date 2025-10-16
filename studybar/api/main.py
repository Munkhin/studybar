# This is the main entry point

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from studybar.api.routes import flashcards, tutor
from studybar.api.routes import users, errors

app = FastAPI(title="StudyBar API", version="1.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.app\.github\.dev",  # Allow all GitHub Codespaces URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Mount routers
app.include_router(flashcards.router, prefix="/api/flashcards", tags=["Flashcards"])
app.include_router(tutor.router, prefix="/api/tutor", tags=["TutorGPT"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(errors.router, prefix="/api/errors", tags=["Errors"])

@app.get("/")
def root():
    return {"status": "ok", "message": "StudyBar backend running"}
