import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import Layout from "../components/layout";

type Vaga = {
  id: string;
  titulo: string;
  descricao: string;
  tecnologias: string[];
};

export default function Vagas() {
  const [vagas, setVagas] = useState<Vaga[]>([]);

  useEffect(() => {
    api.get("/vagas").then((r) => setVagas(r.data));
  }, []);

  return (
    <Layout>
      <h1 style={{ marginTop: 0 }}>Vagas</h1>
      <div className="grid">
        {vagas.map((v) => (
          <div key={v.id} className="card">
            <h3 style={{ marginTop: 0 }}>{v.titulo}</h3>
            <p className="muted" style={{ fontSize: "0.95rem" }}>
              {v.descricao.slice(0, 220)}
              {v.descricao.length > 220 ? "…" : ""}
            </p>
            <p className="muted" style={{ fontSize: "0.85rem" }}>
              Stack: {v.tecnologias?.join(", ") || "—"}
            </p>
            <Link to={`/candidato/vagas/${v.id}`}>Detalhes e candidatura</Link>
          </div>
        ))}
        {vagas.length === 0 && (
          <p className="muted">
            Sem vagas públicas. Crie uma com o utilizador recrutador (seed).
          </p>
        )}
      </div>
    </Layout>
  );
}
