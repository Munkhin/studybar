import { useState, useEffect, useRef } from "react";
import api from "@/lib/api";
import type { Flashcard, FlashcardsResponse, JobStatusResponse } from "@/types/api";

export function useFlashcardJob() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<number | null>(null);

  useEffect(() => {
    if (!jobId) return;
    setStatus("pending");

    const poll = async () => {
      try {
        const s: JobStatusResponse = await api.getJson(`/api/flashcards/status/${jobId}`);
        setStatus(s.status);
        if (s.status === "done") {
          const res: FlashcardsResponse = await api.getJson(`/api/flashcards/job/${jobId}`);
          setFlashcards(res.flashcards || null);
          if (pollingRef.current) {
            window.clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
        }
        if (s.status === "error") {
          setError(s.error || "unknown error");
          if (pollingRef.current) {
            window.clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
        }
      } catch (e: any) {
        setError(e?.message || String(e));
      }
    };

    // start polling every 2s
    poll();
    pollingRef.current = window.setInterval(poll, 2000);

    return () => {
      if (pollingRef.current) window.clearInterval(pollingRef.current);
    };
  }, [jobId]);

  async function uploadPdf(file: File) {
    setError(null);
    setFlashcards(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const resp: FlashcardsResponse = await api.postFormData(`/api/flashcards/generate`, fd);
      if (resp.status === "cached") {
        setFlashcards(resp.flashcards || null);
        setStatus("done");
      } else if (resp.status === "accepted" && resp.job_id) {
        setJobId(resp.job_id);
        setStatus("pending");
      } else {
        // unknown shape
        setError("Unexpected response from server");
      }
    } catch (e: any) {
      setError(e?.message || String(e));
    }
  }

  return { jobId, status, flashcards, error, uploadPdf } as const;
}
