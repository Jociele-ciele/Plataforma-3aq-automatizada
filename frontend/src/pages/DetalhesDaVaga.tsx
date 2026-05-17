import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import Layout from "../components/layout";

type Vaga = {
  id: string;
  titulo: string;
  descricao: string;
  tecnologias: string[];
  desafios: { id: string; titulo: string; codigo_inicial: string }[];
};

export default function DetalhesDaVaga() {
  const { id } = useParams();
  const [vaga, setVaga] = useState<Vaga | null>(null);
  const [candidaturaId, setCandidaturaId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api.get(`/vagas/${id}`).then((r) => setVaga(r.data));
  }, [id]);

  async function candidatar() {
    if (!vaga) return;
    setMsg(null);
    try {
      const { data } = await api.post("/candidaturas", {
        vaga_id: vaga.id,
      });
      setCandidaturaId(data.id);
      setMsg("Candidatura registada. Pode abrir o teste técnico.");
    } catch (e: unknown) {
      const er = (e as { response?: { data?: { error?: string } } }).response
        ?.data?.error;
      setMsg(er ?? "Falha na candidatura");
    }
  }

  if (!vaga) {
    return (
      <Layout>
        <p className="muted">A carregar…</p>
      </Layout>
    );
  }

  const desafio = vaga.desafios[0];

  return (
    <Layout>
      <p>
        <Link to="/candidato/vagas">← Voltar</Link>
      </p>
      <h1 style={{ marginTop: 0 }}>{vaga.titulo}</h1>
      <p style={{ whiteSpace: "pre-wrap" }}>{vaga.descricao}</p>
      <p className="muted">Stack: {vaga.tecnologias.join(", ")}</p>

      <div className="card" style={{ marginTop: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Candidatura</h3>
        <button type="button" className="secondary" onClick={candidatar}>
          Candidatar-me
        </button>
        {msg && (
          <p className="muted" style={{ marginTop: "0.75rem" }}>
            {msg}
          </p>
        )}
        {candidaturaId && desafio && (
          <p style={{ marginTop: "1rem" }}>
            <Link
              to={`/candidato/teste/${candidaturaId}/${desafio.id}`}
            >
              <button type="button">Abrir teste: {desafio.titulo}</button>
            </Link>
          </p>
        )}
      </div>
    </Layout>
  );
}
