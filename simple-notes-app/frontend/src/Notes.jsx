import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchNotes, createNote, updateNote, deleteNote } from "./api";

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const data = await fetchNotes();
      setNotes(data);
    } catch (e) {
      console.error(e);
    }
  }

  async function onCreate(e) {
    e.preventDefault();
    if (!title) return;
    const n = await createNote({ title, content });
    setNotes([n, ...notes]);
    setTitle("");
    setContent("");
  }

  async function onDelete(id) {
    await deleteNote(id);
    setNotes(notes.filter((x) => x.id !== id));
  }

  async function onEdit(note) {
    const newTitle = prompt("New title", note.title);
    if (newTitle == null) return;
    const updated = await updateNote(note.id, { title: newTitle, content: note.content });
    setNotes(notes.map((n) => (n.id === updated.id ? updated : n)));
  }

  return (
    <div style={{ maxWidth: 760, margin: "2rem auto", padding: 16 }}>
      <nav style={{ marginBottom: '1rem', textAlign: 'right' }}>
        <Link to="/register">Register</Link>
      </nav>
      <h1>Simple Notes</h1>
      <form onSubmit={onCreate} style={{ marginBottom: 16 }}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" style={{width:'100%'}} />
        <br />
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Content" style={{width:'100%',height:80}} />
        <br />
        <button type="submit">Create</button>
      </form>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {notes.map((n) => (
          <li key={n.id} style={{ borderBottom: "1px solid #eee", padding: 12 }}>
            <strong>{n.title}</strong>
            <p>{n.content}</p>
            <button onClick={() => onEdit(n)}>Edit</button>{" "}
            <button onClick={() => onDelete(n.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}