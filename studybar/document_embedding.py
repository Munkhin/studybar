# document -> embeddings for llm retrieval

import fitz
from openai import OpenAI
from dotenv import load_dotenv
import numpy as np
import os, json

load_dotenv()
client = OpenAI()

DATA_PATH = "/workspaces/studybar/studybar/data/embeddings"


# overal pdf processing function
def process_pdf(pdf_path):
    bucket_name = os.path.splitext(os.path.basename(pdf_path))[0].lower().replace(" ", "_")
    chunks = extract_text_chunks(pdf_path)
    chunks = embed_chunks(chunks)
    save_embeddings(chunks, bucket_name)
    return bucket_name


# pdf -> text chunks
def extract_text_chunks(pdf_path):
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


# chunks -> embeddings
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


# save embeddings into buckets
def save_embeddings(chunks, bucket_name):
    path = os.path.join(DATA_PATH, f"{bucket_name}.json")

    serializable_chunks = []
    for c in chunks:
        item = c.copy()
        if isinstance(item.get("embedding"), np.ndarray):
            item["embedding"] = item["embedding"].tolist()
        serializable_chunks.append(item)

    with open(path, "w", encoding="utf-8") as f:
        json.dump(serializable_chunks, f, ensure_ascii=False, indent=2)

    print(f"[✓] Saved {len(serializable_chunks)} chunks to {path}")


# helper cosine similarity function for retrieval
def _cosine_sim(a, b):
    # small numerical safety
    an = np.linalg.norm(a)
    bn = np.linalg.norm(b)
    if an == 0 or bn == 0:
        return 0.0
    return float(np.dot(a, b) / (an * bn))


# class to handel buckets
class BucketedIndex:
    def __init__(self, data_path=DATA_PATH):
        self.data_path = data_path
        self.buckets = {}  # {topic_name: [chunks]}
        self._load_all()

    def _load_all(self):
        """Load all embedding JSON files into memory."""
        for fname in os.listdir(self.data_path):
            if fname.endswith(".json"):
                topic = os.path.splitext(fname)[0]
                path = os.path.join(self.data_path, fname)
                with open(path, "r", encoding="utf-8") as f:
                    chunks = json.load(f)
                    for c in chunks:
                        c["embedding"] = np.array(c["embedding"], dtype=np.float32)
                    self.buckets[topic] = chunks
        print(f"[✓] Loaded {len(self.buckets)} topic buckets")

    def get_contexts(self, topic, student_level=0.5, k=8):
        """
        Retrieve top-k chunks from the topic bucket based on relevance.
        student_level can influence filtering or weighting in the future.
        """
        if topic not in self.buckets:
            raise ValueError(f"No embeddings found for topic '{topic}'")

        bucket = self.buckets[topic]

        # For now, we’ll just take random or first K chunks
        # Later, you can bias by difficulty level or subtopics
        if len(bucket) <= k:
            return bucket
        else:
            import random
            return random.sample(bucket, k)