const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

export async function register(credentials) {
  const r = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  const data = await r.json();
  if (!r.ok) {
    throw new Error(data.error || "An error occurred");
  }
  return data;
}

export async function fetchNotes() {
  const r = await fetch(`${API_BASE}/notes`);
  return r.json();
}
export async function createNote(note) {
  const r = await fetch(`${API_BASE}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });
  return r.json();
}
export async function updateNote(id, note) {
  const r = await fetch(`${API_BASE}/notes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });
  return r.json();
}
export async function deleteNote(id) {
  await fetch(`${API_BASE}/notes/${id}`, { method: "DELETE" });
}
