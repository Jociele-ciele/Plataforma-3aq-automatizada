import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import Layout from "../components/layout";

type Desafio = {
  id: string;
  titulo: string;
  descricao: string;
  codigo_inicial: string;
};

export default function PageTeste() {
  const { applicationId, challengeId } = useParams();
  const [desafio, setDesafio] = useState<Desafio | null>(null);
  const [codigo, setCodigo] = useState("");
  const [resultado, setResultado] = useState<Record<string, unknown> | null>(
    null,
  );
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!challengeId) return;
    api.get("/candidaturas/minhas").then((r) => {
      const candidaturas = r.data as {
        vaga: { desafios: Desafio[] };
      }[];
      const d = candidaturas
        .flatMap((c) => c.vaga.desafios)
        .find((x) => x.id === challengeId);
      if (d) {
        setDesafio(d);
        setCodigo(d.codigo_inicial ?? "");
      }
    });
  }, [challengeId]);

  async function submeter() {
    if (!applicationId || !challengeId) return;
    setErr(null);
    try {
      const { data } = await api.post("/submissoes", {
        candidatura_id: applicationId,
        desafio_id: challengeId,
        codigo,
      });
      setResultado(data);
    } catch (e: unknown) {
      setErr(
        String(
          (e as { response?: { data?: { error?: string } } }).response?.data
            ?.error ?? e,
        ),
      );
    }
  }

  if (!desafio) {
    return (
      <Layout>
        <p className="muted">
          A carregar desafio… (confirme que está candidato e que o id do
          desafio é válido)
        </p>
        <p>
          <Link to="/candidato/vagas">← Vagas</Link>
        </p>
      </Layout>
    );
  }

  return (
    <Layout>
      <p>
        <Link to="/candidato/vagas">← Vagas</Link>
      </p>
      <h1 style={{ marginTop: 0 }}>{desafio.titulo}</h1>
      <p style={{ whiteSpace: "pre-wrap" }}>{desafio.descricao}</p>

      <label htmlFor="code">Código (JavaScript — função solution)</label>
      <textarea
        id="code"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
        spellCheck={false}
      />

      <div
        style={{
          marginTop: "0.75rem",
          display: "flex",
          gap: "0.5rem",
          flexWrap: "wrap",
        }}
      >
        <button type="button" onClick={submeter}>
          Submeter e corrigir
        </button>
      </div>

      {err && (
        <p className="error" style={{ marginTop: "1rem" }}>
          {err}
        </p>
      )}

      {resultado && (
        <div className="card" style={{ marginTop: "1rem" }}>
          <h3 style={{ marginTop: 0 }}>Resultado imediato (RN03)</h3>
          <p>
            Pontuação:{" "}
            <strong>{String(resultado.percentual_nota)}%</strong> — casos:{" "}
            {String(resultado.testes_aprovados)}/{String(resultado.total_testes)}
          </p>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.85rem" }}>
            {String(resultado.feedback ?? "")}
          </pre>
        </div>
      )}
    </Layout>
  );
}
