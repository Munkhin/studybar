# document -> embeddings for llm retrieval

import fitz
from openai import OpenAI
from dotenv import load_dotenv
import numpy as np

load_dotenv()
client = OpenAI()

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
            if not (5 <= len(text.split()) <= 500):
                continue

            chunks.append({
                "id": f"p{page_index+1}_b{bi}",
                "page": page_index + 1,
                "text": text
            })
    return chunks

def embed_chunks(chunks, model="text-embedding-3-large", batch_size=256):
    """
    Add an 'embedding' vector to each chunk in-place.
    Uses the OpenAI Embeddings API via client.embeddings.create.
    """
    texts = [c["text"] for c in chunks]
    for i in range(0, len(texts), batch_size):
        batch_texts = texts[i : i + batch_size]
        resp = client.embeddings.create(model=model, input=batch_texts)
        for j, item in enumerate(resp.data):
            emb = item.embedding
            chunks[i + j]["embedding"] = np.array(emb, dtype=np.float32)
    return chunks


# helper cosine similarity function for retrieval
def _cosine_sim(a, b):
    # small numerical safety
    an = np.linalg.norm(a)
    bn = np.linalg.norm(b)
    if an == 0 or bn == 0:
        return 0.0
    return float(np.dot(a, b) / (an * bn))