# pdf/img -> text,eqns,diagrams

import io
import fitz  # PyMuPDF for PDF page images
import cv2
import pytesseract
import numpy as np
from PIL import Image


class OCRExtractor:

    def __init__(self, embed_fn_text=None, embed_fn_image=None):
        """
        Args:
            embed_fn_text: Callable that takes text → embedding (optional)
            embed_fn_image: Callable that takes np.array → embedding (optional)
        """
        self.embed_text = embed_fn_text
        self.embed_image = embed_fn_image

    # overall extract function
    def extract(self, file_path: str):

        # case 1: file is a pdf
        if file_path.lower().endswith(".pdf"):
            return self._extract_from_pdf(file_path)
        
        # case 2: file is an image
        elif file_path.lower().endswith(".img"):
            return self._extract_from_image(file_path)
        
        # case 3: file is not of supported types
        else:
            return None


    def _extract_from_pdf(self, pdf_path: str):
        doc = fitz.open(pdf_path)
        all_pages = []
        for i, page in enumerate(doc):
            pix = page.get_pixmap(dpi=200)
            img = Image.open(io.BytesIO(pix.tobytes("png")))
            result = self._extract_from_pil(img)
            result["page"] = i + 1
            all_pages.append(result)
        return all_pages



    def _extract_from_image(self, img_path: str):
        img = cv2.imread(img_path)
        return self._extract_from_cv(img)


    def _extract_from_pil(self, pil_img: Image.Image):
        cv_img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
        return self._extract_from_cv(cv_img)


    def _extract_from_cv(self, cv_img: np.ndarray):
        """
        Core OCR + analysis logic.
        """
        # Step 1: OCR for text (supports handwritten via Tesseract or TrOCR if extended)
        text = pytesseract.image_to_string(cv_img, config="--psm 6").strip()

        # Step 2: Detect possible equations (look for typical math symbols)
        eq_detected = any(sym in text for sym in ["=", "+", "-", "→", "⇌", "^", "_", "\\frac", "\\sqrt"])
        has_diagram = self._detect_diagram(cv_img)

        # Step 3: Prepare embeddings if available
        embedding_text = self.embed_text(text) if (self.embed_text and text) else None
        embedding_img = self.embed_image(cv_img) if (self.embed_image and has_diagram) else None

        return {
            "text": text,
            "equation": eq_detected,
            "diagram": has_diagram,
            "embedding_text": embedding_text,
            "embedding_image": embedding_img,
        }


    def _detect_diagram(self, cv_img: np.ndarray) -> bool:
        """
        Simple heuristic: diagrams tend to have sparse text and more lines.
        (Later can use CNN or CLIP vision classifier)
        """
        gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 80, 150)
        line_count = np.sum(edges > 0)
        h, w = gray.shape
        density = line_count / (h * w)
        return density > 0.01  # adjustable threshold