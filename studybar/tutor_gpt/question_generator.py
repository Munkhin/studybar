# chunks -> questions for the topic

import sys
import os

# 1. Get the path to the current file's directory
current_dir = os.path.dirname(os.path.abspath(__file__))

# 2. Get the path to the parent directory by moving up one level
parent_dir = os.path.dirname(current_dir)

# 3. Add the parent directory to sys.path
sys.path.append(parent_dir)

#-------------------------------------------#
from document_embedding import process_pdf, BucketedIndex

from openai import OpenAI
from dotenv import load_dotenv
import json
import uuid


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

        response = client.responses.create(
                model="gpt-5-mini",
                reasoning={"effort": "low"},
                input=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ]
            )

        raw = getattr(response, "output_text", "").strip()

        # try to parse JSON directly
        try:
            problems = json.loads(raw)
            # ensure ids
            for p in problems:
                p.setdefault("id", str(uuid.uuid4()))
            return {"problems": problems, "contexts": contexts}
        except Exception:
            # try extract JSON substring
            import re
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
    pdf_path = "/workspaces/studybar/studybar/data/test_pdfs/atomic_structure.pdf"
    process_pdf(pdf_path)

    # 1. Load your bucketed embeddings
    index = BucketedIndex("/workspaces/studybar/studybar/data/embeddings")

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
