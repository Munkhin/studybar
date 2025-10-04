"""
Final precise extractor for boxed definitions in science PDFs.

Fixes:
- Removes trends, equations, tables, and numeric ratio text.
- Removes incomplete or malformed phrases (“of deflection”, “on losing…”).
- Keeps only contiguous, grammatical definitions with a clear noun + 'is/are/defined as'.
- Separates 1st/2nd/nth ionisation energy properly.
- Uses Responses API with gpt-5-mini (reasoning_effort="medium").
"""

import re, json, fitz, cv2, numpy as np
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()
client = OpenAI()

# ---------------- PDF preprocessing ----------------

def ingest_pdf_as_images(pdf_path, dpi=150):
    doc = fitz.open(pdf_path)
    out = []
    for i, p in enumerate(doc):
        pix = p.get_pixmap(dpi=dpi)
        arr = np.frombuffer(pix.samples, np.uint8).reshape(pix.height, pix.width, pix.n)
        if pix.n == 4:
            arr = cv2.cvtColor(arr, cv2.COLOR_RGBA2RGB)
        out.append((i, arr))
    return out

def detect_boxes(images, min_area=3000):
    boxes_per_page = {}
    for page_num, img in images:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 60, 180)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        boxes = []
        for c in contours:
            x, y, w, h = cv2.boundingRect(c)
            if w * h > min_area:
                boxes.append((x, y, x + w, y + h))
        boxes.sort(key=lambda b: (b[1], b[0]))
        boxes_per_page[page_num] = boxes
    return boxes_per_page

def extract_box_text(pdf_path, boxes_per_page, expand=6):
    doc = fitz.open(pdf_path)
    chunks = []
    for pnum, boxes in boxes_per_page.items():
        page = doc[pnum]
        words = page.get_text("words")
        for i, (x0, y0, x1, y1) in enumerate(boxes):
            ex0, ey0, ex1, ey1 = x0-expand, y0-expand, x1+expand, y1+expand
            region = [w[4] for w in words if ex0 <= w[0] <= ex1 and ey0 <= w[1] <= ey1]
            if not region: continue
            txt = re.sub(r'\s+', ' ', ' '.join(region)).strip()
            if len(txt) > 20:
                chunks.append({"id": f"p{pnum+1}_b{i}", "page": pnum+1, "text": txt})
    return chunks

# ---------------- LLM prompt ----------------

SYSTEM_PROMPT = """
You extract *only true conceptual definitions* from science text.

Definition = a statement that assigns a precise meaning to a concept, e.g.:
"First ionisation energy is the energy required to remove one mole of electrons from one mole of gaseous atoms to form one mole of unipositively charged gaseous ions."

Rules:
- Must contain a clear subject noun (e.g., 'Ionisation energy', 'Atomic number').
- Must contain an explanatory verb ('is', 'are', 'refers to', 'defined as', or '=').
- Must read as a complete English clause.
- Exclude any:
  * numeric tables, equations, q/m ratios, deflection angles
  * trend statements (“increases across a period…”, “decreases down a group…”)
  * incomplete fragments (“of deflection”, “on losing an electron…”)
  * trivia or historical notes (“Democritus called…”)
- If multiple distinct definitions (e.g., first/second ionisation energy) appear, return them separately.
- Return only JSON array with fields: term, definition, page, source_id.
"""

def build_prompt(chunks):
    body = []
    for c in chunks:
        body.append(f"[{c['id']} | page {c['page']}]\n{c['text']}")
    return "\n\n".join(body)

# ---------------- Regex + filters ----------------

INCOMPLETE_RE = re.compile(r'^(of|that|on|when|after|as|dependent|given|in)\b', re.I)
TREND_RE = re.compile(r'\b(increase|decrease|trend|across a period|down a group)\b', re.I)
EQUATION_RE = re.compile(r'[\d\+\-\=\×θ°µA-Za-z]*[=][^A-Za-z]*')
NUMERIC_HEAVY = re.compile(r'\d{3,}')
SYMBOL_HEAVY = re.compile(r'[θ±∴∆→≤≥µ%]{1,}')

def looks_like_definition(term, definition):
    # reject if either side malformed
    if not term or not definition: return False
    if INCOMPLETE_RE.match(term): return False
    if TREND_RE.search(definition): return False
    if EQUATION_RE.search(definition): return False
    if NUMERIC_HEAVY.search(definition) and len(definition.split()) < 8: return False
    if SYMBOL_HEAVY.search(definition): return False
    if len(definition.split()) < 5: return False
    if not re.search(r'\b(is|are|defined as|refers to|means)\b', definition): return False
    return True

# ---------------- Main extraction ----------------

def extract_definitions(pdf_path):
    images = ingest_pdf_as_images(pdf_path)
    boxes = detect_boxes(images)
    chunks = extract_box_text(pdf_path, boxes)
    print(f"[INFO] Detected {len(chunks)} boxed text regions.")

    resp = client.responses.create(
        model="gpt-5-mini",
        reasoning={"effort":"low"},
        input=[{"role": "system", "content": SYSTEM_PROMPT},
               {"role": "user", "content": build_prompt(chunks)}]
    )
    raw = getattr(resp, "output_text", "").strip()
    try:
        data = json.loads(re.search(r'(\[.*\])', raw, re.S).group(1))
    except Exception:
        data = []

    # fallback cleanup
    clean = []
    for d in data:
        t = d.get("term","").strip(" :.-")
        df = d.get("definition","").strip()
        if looks_like_definition(t, df):
            clean.append({"term": t, "definition": df, "page": d.get("page"), "source": d.get("source_id")})
    return clean

def make_flashcards(defs):
    cards = []
    for d in defs:
        cards.append({
            "Q": f"What is {d['term']}?",
            "A": d['definition'],
            "meta": {"page": d['page'], "source": d['source']}
        })
    return cards

# ---------------- Run ----------------

if __name__ == "__main__":
    pdf = "test2.pdf"
    defs = extract_definitions(pdf)
    cards = make_flashcards(defs)
    print(f"\nFinal Flashcards ({len(cards)}):\n")
    print(json.dumps(cards, indent=2, ensure_ascii=False))
