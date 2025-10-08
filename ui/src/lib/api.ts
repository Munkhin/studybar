const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:8000";

async function getJson(path: string) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${await res.text()}`);
  return res.json();
}

async function postFormData(path: string, formData: FormData) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${await res.text()}`);
  return res.json();
}

async function postForm(path: string, body: Record<string, string>) {
  const form = new URLSearchParams(body);
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${await res.text()}`);
  return res.json();
}

export default {
  getJson,
  postFormData,
  postForm,
};
