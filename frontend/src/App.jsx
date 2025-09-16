import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Notes from "./Notes"; // We will move the notes logic here
import Register from "./Register";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Notes />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}
