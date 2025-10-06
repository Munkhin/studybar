# document -> embeddings for llm retrieval

import fitz
from openai import OpenAI
from dotenv import load_dotenv
import numpy as np
import os, json
import cv2

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


# === single text -> embedding ===
def embed_text(text: str, model="text-embedding-3-large"):
    """
    Generate an embedding vector for a single text string.
    """
    if not text or not text.strip():
        return np.zeros(1536, dtype=np.float32)  # default vector length
    resp = client.embeddings.create(model=model, input=[text])
    return np.array(resp.data[0].embedding, dtype=np.float32)


# === image -> embedding ===
def embed_image(image: np.ndarray, model="clip-embedding-3-large"):
    """
    Generate an embedding for an image (e.g. diagrams, sketches).
    The model name assumes an OpenAI or CLIP-style vision encoder.
    """
    import base64
    from io import BytesIO
    from PIL import Image

    # Convert image array to PNG bytes
    if isinstance(image, np.ndarray):
        img = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
    else:
        img = image

    buf = BytesIO()
    img.save(buf, format="PNG")
    b64_img = base64.b64encode(buf.getvalue()).decode("utf-8")

    # Call embeddings endpoint with image input
    resp = client.embeddings.create(
        model=model,
        input=[
            {
                "type": "image",
                "image": {"b64_json": b64_img}
            }
        ]
    )
    return np.array(resp.data[0].embedding, dtype=np.float32)


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


# class to handle buckets
class BucketedIndex:
    def __init__(self, data_path=DATA_PATH):
        self.data_path = data_path
        self.buckets = {}  # {topic_name: [chunks]}
        self._load_all()

    def _load_all(self):
        """Load all embedding JSON files into memory."""
        if not os.path.exists(self.data_path):
            os.makedirs(self.data_path, exist_ok=True)
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
        Retrieve top-k chunks from the main topic bucket, and optionally mix in
        chunks from other topics depending on proficiency level.
        """
        import random
        if topic not in self.buckets:
            raise ValueError(f"No embeddings found for topic '{topic}'")

        # Always get base topic chunks
        main_bucket = self.buckets[topic]
        main_chunks = random.sample(main_bucket, min(k, len(main_bucket)))

        # Determine if cross-topic sampling is needed
        if student_level > 0.7:
            # Number of additional topics to include
            n_extra = int((student_level - 0.7) / 0.1) + 1

            # Select random other topics
            other_topics = [t for t in self.buckets.keys() if t != topic]
            random.shuffle(other_topics)
            selected_topics = other_topics[:n_extra]

            # Pull k//2 chunks from each selected topic
            cross_chunks = []
            for t in selected_topics:
                b = self.buckets[t]
                cross_chunks.extend(random.sample(b, min(k // 2, len(b))))

            # Combine & shuffle
            combined = main_chunks + cross_chunks
            random.shuffle(combined)
            return combined[:k + len(cross_chunks)]
        else:
            # Normal single-topic behavior
            return main_chunks


