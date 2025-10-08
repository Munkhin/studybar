import { useState } from "react";
import api from "@/lib/api";

export function useStudentProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function getProfile(studentId: string) {
    setLoading(true);
    setError(null);
    try {
      const resp = await api.getJson(`/api/students/${encodeURIComponent(studentId)}`);
      setLoading(false);
      return resp;
    } catch (e: any) {
      setError(e?.message || String(e));
      setLoading(false);
      throw e;
    }
  }

  async function updateProfile(studentId: string, body: Record<string, any>) {
    setLoading(true);
    setError(null);
    try {
      const resp = await api.postForm(`/api/students/${encodeURIComponent(studentId)}`, body as Record<string, string>);
      setLoading(false);
      return resp;
    } catch (e: any) {
      setError(e?.message || String(e));
      setLoading(false);
      throw e;
    }
  }

  return { getProfile, updateProfile, loading, error } as const;
}
