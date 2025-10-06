# pdf/img -> correctness, guiding question

from .ocr_utils import OCRExtractor
from .marker import AnswerMarker
from studybar.document_embedding import embed_text, embed_image  # optional


# main function
def get_feedback(answer_file_path, question, context, topic=None, student_id=None):
    from ocr_utils import OCRExtractor
    from marker import AnswerMarker

    ocr = OCRExtractor()
    data = ocr.extract(answer_file_path)

    marker = AnswerMarker()
    result = marker.mark(student_answer=data[0]["text"], question_text=question, reference_context=context)

    # Optional: add metadata
    result["topic"] = topic
    result["student_id"] = student_id
    return result
