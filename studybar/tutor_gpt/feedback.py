# pdf/img -> correctness, guiding question 

import os
from studybar.tutor_gpt.ocr_utils import OCRExtractor
from studybar.tutor_gpt.marker import AnswerMarker
from studybar.document_embedding import embed_text, embed_image  # optional


def get_feedback(answer_file_path, question, context, topic=None, student_id=None):
    """
    Evaluate a student's answer (pdf/image/text) and return feedback.
    Uses absolute imports to avoid path issues.
    """
    # ensure absolute path for input file
    answer_file_path = os.path.abspath(answer_file_path)

    # initialize OCR and marking modules
    ocr = OCRExtractor()
    data = ocr.extract(answer_file_path)

    marker = AnswerMarker()
    result = marker.mark(
        student_answer=data[0]["text"],
        question_text=question,
        reference_context=context
    )

    # attach metadata for traceability
    result["topic"] = topic
    result["student_id"] = student_id
    result["source_path"] = answer_file_path

    return result
