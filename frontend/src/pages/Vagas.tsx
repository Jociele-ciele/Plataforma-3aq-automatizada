import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import Layout from "../components/layout";

type Job = {
  id: string;
  title: string;
  description: string;
  stack: string[];
};
export default function Vagas() {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    api.get("/jobs").then((r) => setJobs(r.data));
  }, []);

  return (
    <Layout>
      <h1 style={{ marginTop: 0 }}>Vagas</h1>
      <div className="grid">
        {jobs.map((j) => (
          <div key={j.id} className="card">
            <h3 style={{ marginTop: 0 }}>{j.title}</h3>
            <p className="muted" style={{ fontSize: "0.95rem" }}>
              {j.description.slice(0, 220)}
              {j.description.length > 220 ? "…" : ""}
            </p>
            <p className="muted" style={{ fontSize: "0.85rem" }}>
              Stack: {j.stack?.join(", ") || "—"}
            </p>
            <Link to={`/candidato/vagas/${j.id}`}>Detalhes e candidatura</Link>
          </div>
        ))}
        {jobs.length === 0 && <p className="muted">Sem vagas públicas. Crie uma com o utilizador recrutador (seed).</p>}
      </div>
    </Layout>
  );
}