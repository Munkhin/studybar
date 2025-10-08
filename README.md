StudyBar
========

Quick start (development)

1. Backend

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env and set OPENAI_API_KEY
uvicorn studybar.api.main:app --reload --host 0.0.0.0 --port 8000
```

2. Frontend

```bash
cd ui
npm install
npm run dev
```

Notes:
- The backend uses OpenAI; set OPENAI_API_KEY in `.env` before running.
- Jobs are persisted to `studybar/data/job_store.sqlite`.
# studybar
A study app to solve time loss and context switching.

**Feature bucketlist:**
- [✔] flashcard maker so you dont need to spend time looking through notes for definitions

- [✔] tutor gpt
    - [✔] question generating from context
        - [✔] cross topic context selection beyond a certain proficiency level
        - [ ] semantic weighing for cross topic selection(if needed)
    - [✔] ocr and marking
        - [✔] guiding questions when you have failed to answer some question 
        - [✔] mistake log to keep track of errors
            - [ ] mistake log sorting
    - [✔] proficiency adjusting mechanism
    - [✔] history management


**UI design:**

- [ ] Homescreen
    - [ ] main content to display progress for different subjects and maybe the next thing to work on
    - [ ] navigation sidebar
        - [ ] choose subject (create subject as well)
            - [ ] see all flashcards
            - [ ] choose topic (create topic as well)
            - [ ] general
            - [ ] error log daily view
        - [ ] account management

-> [ ] topical view
    - [ ] pdf upload (see all pdfs uploaded as well)
    - [ ] flashcards
    - [ ] tutor gpt
    - [ ] error log topical view

-> [ ] flashcards 
    - [ ] delete button at the top left hand corner
    - [ ] edit on the fly by just clicking on the text
    - [ ] swiping animation
        - [ ] swipe right to understand it now
        - [ ] swipe left to revise further later


-> [ ] tutor gpt
    - [ ] gpt style chat interface
        These will be connected via some button, the user can see the complete loop for 1 single question by itself
        - [ ] generated questions
        - [ ] guiding question
        - [ ] feedback
    - [ ] map view (navigation view)
        - [ ] search function
    - [ ] error log topical view (accessibility)