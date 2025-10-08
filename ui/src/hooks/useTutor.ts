import { useState } from "react";
import api from "@/lib/api";

export function useTutor() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendMessage(studentId: string, subject: string, message: string) {
    setLoading(true);
    setError(null);
    try {
      const resp = await api.postForm(`/api/tutor/chat`, { student_id: studentId, subject, message });
      setLoading(false);
      return resp; // expected { reply: string }
    } catch (e: any) {
      setError(e?.message || String(e));
      setLoading(false);
      throw e;
    }
  }

  async function getHistory(studentId: string, subject: string) {
    setLoading(true);
    setError(null);
    try {
      const resp = await api.getJson(`/api/tutor/${encodeURIComponent(studentId)}/${encodeURIComponent(subject)}/history`);
      setLoading(false);
      return resp; // { status: 'ok'|'empty', messages: [...] }
    } catch (e: any) {
      setError(e?.message || String(e));
      setLoading(false);
      throw e;
    }
  }

  return { sendMessage, getHistory, loading, error } as const;
}
