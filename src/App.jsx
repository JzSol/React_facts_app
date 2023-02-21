import React, { useEffect, useState } from "react";
import supabase from "./supabase";

import "./style.css";

const CATEGORIES = [
  { name: "technology", color: "#3b82f6" },
  { name: "science", color: "#16a34a" },
  { name: "finance", color: "#ef4444" },
  { name: "society", color: "#eab308" },
  { name: "entertainment", color: "#db2777" },
  { name: "health", color: "#14b8a6" },
  { name: "history", color: "#f97316" },

  { name: "news", color: "#8b5cf6" },
];

export default function App() {
  const [showForm, setShowForm] = useState(false);
  const [facts, setFacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("all");

  useEffect(
    function () {
      async function fetchData() {
        setIsLoading(true);

        let query = supabase.from("facts").select("*");

        if (currentCategory !== "all") {
          query = query.eq("category", currentCategory);
        }

        const { data: facts, error } = await query
          .order("votesInteresting", { ascending: false })
          .limit(1000);

        if (!error) setFacts(facts);
        else alert("There was an error fetching the facts");
        setFacts(facts);
        setIsLoading(false);
      }
      fetchData();
    },
    [currentCategory]
  );

  return (
    <>
      <Header showForm={showForm} setShowForm={setShowForm} />
      {showForm ? (
        <NewFactForm setFacts={setFacts} setShowForm={setShowForm} />
      ) : null}

      <main className="main">
        <CategoryFilter setCurrentCategory={setCurrentCategory} />
        {isLoading ? (
          <Loader />
        ) : (
          <FactList facts={facts} setFacts={setFacts} />
        )}
      </main>
    </>
  );
}

function Loader() {
  return <p className="message">Loading...</p>;
}

function Header({ showForm, setShowForm }) {
  return (
    <header className="header">
      <div className="logo">
        <img src="logo.png" height="68" width="68" alt="Today I Learned Logo" />
        <h1>Today I Learned</h1>
      </div>

      <button
        className="btn btn-large btn-open"
        onClick={() => setShowForm((show) => !show)}
      >
        {showForm ? "Close" : "Share a fact"}
      </button>
    </header>
  );
}

function isValidUrl(input) {
  try {
    new URL(input);
    return true;
  } catch (error) {
    return false;
  }
}

function NewFactForm({ setFacts, setShowForm }) {
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

function CategoryFilter({ setCurrentCategory }) {
  return (
    <aside>
      <ul>
        <li className="category">
          <button
            className="btn btn-all-categories"
            onClick={() => setCurrentCategory("all")}
          >
            All
          </button>
        </li>

        {CATEGORIES.map((category) => (
          <li key={category.name} className="category">
            <button
              className="btn btn-category"
              style={{ backgroundColor: category.color }}
              onClick={() => setCurrentCategory(category.name)}
            >
              {category.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function FactList({ facts, setFacts }) {
  if (facts.length === 0)
    return (
      <p className="message">No facts for this category! Create first one ✌️</p>
    );

  return (
    <section>
      <ul className="facts-list">
        {facts.map((fact) => (
          <Fact fact={fact} key={fact.id} setFacts={setFacts} />
        ))}
      </ul>
      <p>There are {facts.length} facts in the database. Add your own!</p>
    </section>
  );
}

function Fact({ fact, setFacts }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const isDisputed =
    fact.votesInteresting + fact.votesMindblowing < fact.votesFalse;

  async function handleVote(columnName) {
    setIsUpdating(true);
    const { data: updatedFact, error } = await supabase
      .from("facts")
      .update({ [columnName]: fact[columnName] + 1 })
      .eq("id", fact.id)
      .select();
    setIsUpdating(false);

    if (!error)
      setFacts((facts) =>
        facts.map((f) => (f.id === fact.id ? updatedFact[0] : f))
      );
  }
  return (
    <li className="fact" key={fact.id}>
      <p>
        {isDisputed ? <span className="disputed">[⛔️ DISPUTED]</span> : null}
        {fact.text}
        <a className="source" href={fact.source} target="blank">
          (Source)
        </a>
      </p>
      <span
        className="tag"
        style={{
          backgroundColor: CATEGORIES.find((cat) => cat.name === fact.category)
            .color,
        }}
      >
        {fact.category.toUpperCase()}
      </span>
      <div className="vote-buttons">
        <button
          onClick={() => handleVote("votesInteresting")}
          disabled={isUpdating}
        >
          👍 {fact.votesInteresting}
        </button>
        <button
          onClick={() => handleVote("votesMindblowing")}
          disabled={isUpdating}
        >
          🤯 {fact.votesMindblowing}
        </button>
        <button onClick={() => handleVote("votesFalse")} disabled={isUpdating}>
          ⛔️ {fact.votesFalse}
        </button>
      </div>
    </li>
  );
}
