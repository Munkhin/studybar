# This is the main entry point

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from studybar.api.routes import flashcards, tutor

app = FastAPI(title="StudyBar API", version="1.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # adjust later for security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(flashcards.router, prefix="/api/flashcards", tags=["Flashcards"])
app.include_router(tutor.router, prefix="/api/tutor", tags=["TutorGPT"])

@app.get("/")
def root():
    return {"status": "ok", "message": "StudyBar backend running"}
