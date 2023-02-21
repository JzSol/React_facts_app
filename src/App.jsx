import React, { useEffect, useState } from "react";
import supabase from "./supabase";
import { Loader } from "../src/Components/Loader";
import { Header } from "../src/Components/Header";
import { CategoryFilter } from "../src/Components/CategoryFilter";
import { FactList } from "../src/Components/FactList";
import { NewFactForm } from "./Components/NewFactForm";

import "./style.css";

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
