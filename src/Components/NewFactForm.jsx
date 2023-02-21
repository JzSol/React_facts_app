import React, { useState } from "react";
import supabase from "../supabase";
import { CATEGORIES } from "../Categories";

function isValidUrl(input) {
  try {
    new URL(input);
    return true;
  } catch (error) {
    return false;
  }
}

export function NewFactForm({ setFacts, setShowForm }) {
  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  function resetForm() {
    setText("");
    setSource("");
    setCategory("");
  }

  async function handleSubmit(e) {
    // prevent browser realod
    e.preventDefault();
    // check if data is valid. if not, !return
    if (text && isValidUrl(source) && category && text.length <= 200) {
      // Upload fact to supabase and recieve it back
      setIsUploading(true);
      const { data: newFact, error } = await supabase
        .from("facts")
        .insert([{ text, source, category }])
        .select();
      setIsUploading(false);

      // add new fact to UI: add fact to state
      if (!error) setFacts((facts) => [newFact[0], ...facts]);
      // reset input fields
      resetForm();
      // close form
      setShowForm((show) => !show);
    }
  }

  return (
    <form className="fact-form" onSubmit={handleSubmit}>
      {" "}
      <input
        type="text"
        placeholder="Share a fact with the world..."
        value={text}
        onChange={(event) => setText(event.target.value)}
        disabled={isUploading}
      />
      <span>{`${200 - text.length}`}</span>
      <input
        value={source}
        type="text"
        placeholder="Trustworthy source..."
        onChange={(e) => setSource(e.target.value)}
        disabled={isUploading}
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        disabled={isUploading}
      >
        <option value="" disabled selected>
          Choose category:
        </option>
        {CATEGORIES.map((category) => (
          <option key={category.name} value={category.name}>
            {category.name.toUpperCase()}
          </option>
        ))}
      </select>
      <button className="btn btn-large" disabled={isUploading}>
        Post
      </button>
    </form>
  );
}
