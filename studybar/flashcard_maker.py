# pdf -> flashcards


import fitz  # PyMuPDF
import re, json
from openai import OpenAI
from dotenv import load_dotenv


load_dotenv()
client = OpenAI()


# extract the text chunks
def extract_text_chunks(pdf_path):
    """Extract contiguous text chunks from PDF pages."""
    doc = fitz.open(pdf_path)
    chunks = []
    for page_index, page in enumerate(doc):
        blocks = page.get_text("dict")["blocks"]
        for bi, b in enumerate(blocks):
            text = " ".join(
                span["text"]
                for line in b.get("lines", [])
                for span in line.get("spans", [])
            ).strip()
            # discard empty or very short text
            if len(text.split()) < 5:
                continue
            chunks.append({
                "id": f"p{page_index+1}_b{bi}",
                "page": page_index + 1,
                "text": text
            })
    return chunks


# filter the text chunks for characteristics of definitions
def filter_definition_like(chunks):
    """
    Keep chunks that might contain definitions.
    This is a broad, low-precision filter — GPT will handle correctness.
    """
    def looks_definitionish(text):
        # keep if it contains “is”, “are”, “refers to”, “defined as”, “means”
        # or a colon indicating term → definition
        return bool(re.search(r'\b(is|are|refers to|defined as|means)\b', text, re.I)) or ":" in text

    return [c for c in chunks if looks_definitionish(c["text"])]


# llm filter
def llm_filter(candidates):
    """
    Send definition-like chunks to GPT for final segmentation and validation.
    """
    system_prompt = """
You are a precise academic extractor.
Given raw text chunks from a study PDF, extract only *definitions* of terms or concepts.
Rules:
- Each valid definition must clearly define a concept (e.g. “Ionisation energy is the energy required…”)
- Ignore trends, explanations, trivia, graphs, and examples.
- If there are multiple related definitions (e.g. “first ionisation energy”, “second ionisation energy”), extract them separately.
- After completion, remove the low level terms(defined as contributing factors/building blocks to other definitions)
- Return output as a JSON array:
  [{"term": "...", "definition": "...", "page": <int>, "source_id": "<chunk_id>"}]
No text outside the JSON.
"""

    user_prompt = "\n\n".join(
        f"[{c['id']} | page {c['page']}]\n{c['text']}"
        for c in candidates
    )

    response = client.responses.create(
        model="gpt-5-mini",
        reasoning={"effort":"medium"},
        input=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
    )

    raw_output = getattr(response, "output_text", "").strip()
    match = re.search(r'(\[.*\])', raw_output, re.S)
    data = json.loads(match.group(1)) if match else []
    return data


# ------------------ 4. Main ------------------

if __name__ == "__main__":
    pdf_path = "/workspaces/studybar/test_pdfs/test2.pdf"

    # Step 1: Extract chunks
    chunks = extract_text_chunks(pdf_path)
    print(f"[INFO] Extracted {len(chunks)} text chunks from PDF")

    # Step 2: Lightly filter for definition-like text
    candidates = filter_definition_like(chunks)
    print(f"[INFO] {len(candidates)} candidate chunks likely contain definitions")

    # Step 3: LLM definition extraction
    definitions = llm_filter(candidates)
    print(f"[INFO] {len(definitions)} definitions extracted")

    print(json.dumps(definitions, indent=2, ensure_ascii=False))
