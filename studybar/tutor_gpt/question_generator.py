# chunks -> questions for the topic

import sys
import os

# ---- Absolute Path Setup ----
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STUDYBAR_ROOT = os.path.abspath(os.path.join(BASE_DIR, "../../"))
sys.path.append(STUDYBAR_ROOT)

#-------------------------------------------#
from studybar.document_embedding import process_pdf, BucketedIndex

from openai import OpenAI
from dotenv import load_dotenv
import json
import uuid
import re


load_dotenv()
client = OpenAI()


QUESTION_GEN_PROMPT = """
You are a skilled teacher. Using the following context snippets, create {n} problems on the topic "{topic}" targeted at a student with mastery level {difficulty}
(where a 0 represents a complete beginner with little to no knowledge on the topic, and 1 representing complete proficiency over individual concepts within the topic, cross concepts and cross topical items with this topic).
There should be a mix of Multiple Choice Questions and Structured Multi Part Questions.

Return a JSON array (no extra text) of objects with keys:
  - id (string)
  - question (string)
  - answer (string)
  - concepts (array of strings)

Contexts:
{contexts}
"""


class ProblemGenerator:
    def __init__(self, bucketed_index: BucketedIndex):
        self.index = bucketed_index

    def generate_problems(self, topic: str, n: int = 5, difficulty: int = 2, user_prompt: str = ""):
        contexts = self.index.get_contexts(topic, student_level=difficulty, k=8)

        # build a compact contexts string (trim long contexts)
        ctext = "\n\n".join([f"--- {c['id']} (p{c['page']}):\n{c['text'][:800].strip()}" for c in contexts])

        # sub in variables for the propmpt
        system_prompt = QUESTION_GEN_PROMPT.format(n=n, topic=topic, difficulty=difficulty, contexts=ctext)

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]
        )

        raw = response.choices[0].message.content.strip()

        # try to parse JSON directly
        try:
            problems = json.loads(raw)
            # ensure ids
            for p in problems:
                p.setdefault("id", str(uuid.uuid4()))
            return {"problems": problems, "contexts": contexts}
        except Exception:
            # try extract JSON substring
            m = re.search(r"(\[.*\])", raw, re.S)
            if m:
                try:
                    problems = json.loads(m.group(1))
                    for p in problems:
                        p.setdefault("id", str(uuid.uuid4()))
                    return {"problems": problems, "contexts": contexts}
                except Exception:
                    pass
            # fallback: wrap whole raw as single problem
            return {"problems": [{"id": str(uuid.uuid4()), "question": raw.strip(), "answer": "", "concepts": [topic]}], "contexts": contexts}


if __name__ == "__main__":
    # step 0: process the pdf into embeddings(should have already been done)
    pdf_path = os.path.join(STUDYBAR_ROOT, "studybar/data/test_pdfs/atomic_structure.pdf")
    process_pdf(pdf_path)

    # 1. Load your bucketed embeddings
    embeddings_dir = os.path.join(STUDYBAR_ROOT, "studybar/data/embeddings")
    index = BucketedIndex(embeddings_dir)

    # 2. Initialize the generator
    generator = ProblemGenerator(index)

    # 3. Generate problems for a given topic
    topic = "atomic_structure"  # matches the filename atomic_structure.json
    result = generator.generate_problems(
        topic=topic,
        n=3,
        difficulty=0.3,   # 0 = beginner, 1 = expert
        user_prompt="Focus on basic atomic structure and subatomic particles."
    )
    problems = result["problems"]
    contexts = result["contexts"]

    # 4. Print out results
    for i, p in enumerate(problems):
        print(f"\nQ: {p['question']}\nA: {p['answer']}\nConcepts: {p['concepts']}\nContext: {contexts[i]['text'] if i < len(contexts) else ''}\n{'-'*60}")
