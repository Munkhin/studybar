export interface Flashcard {
  id: string;
  front: string;
  back: string;
  page?: number;
  source_id?: string;
  tags?: string[];
}

export interface FlashcardsResponse {
  status: string;
  flashcards?: Flashcard[];
  job_id?: string;
}

export interface JobStatusResponse {
  status: string;
  error?: string;
}
