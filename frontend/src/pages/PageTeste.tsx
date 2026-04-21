import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import Layout from "../components/layout";

type Challenge = {
  id: string;
  title: string;
  description: string;
  starterCode: string;
};

export default function PageTeste() {
  const { applicationId, challengeId } = useParams();
  const [ch, setCh] = useState<Challenge | null>(null);
  const [code, setCode] = useState("");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!challengeId) return;
    api.get("/applications/mine").then((r) => {
      const apps = r.data as { job: { challenges: Challenge[] } }[];
      const c = apps.flatMap((a) => a.job.challenges).find((x) => x.id === challengeId);
      if (c) {
        setCh(c);
        setCode(c.starterCode ?? "");
      }
    });
  }, [challengeId]);

  async function submit() {
    if (!applicationId || !challengeId) return;
    setErr(null);
    try {
      const { data } = await api.post("/submissions", { applicationId, challengeId, code });
      setResult(data);
    } catch (e: unknown) {
      setErr(String((e as { response?: { data?: { error?: string } } }).response?.data?.error ?? e));
    }
  }

  if (!ch) {
    return (
      <Layout>
        <p className="muted">A carregar desafio… (confirme que está candidato e que o id do desafio é válido)</p>
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
      <h1 style={{ marginTop: 0 }}>{ch.title}</h1>
      <p style={{ whiteSpace: "pre-wrap" }}>{ch.description}</p>

      <label htmlFor="code">Código (JavaScript — função solution)</label>
      <textarea id="code" value={code} onChange={(e) => setCode(e.target.value)} spellCheck={false} />

      <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <button type="button" onClick={submit}>
          Submeter e corrigir
        </button>
      </div>

      {err && <p className="error" style={{ marginTop: "1rem" }}>{err}</p>}

      {result && (
        <div className="card" style={{ marginTop: "1rem" }}>
          <h3 style={{ marginTop: 0 }}>Resultado imediato (RN03)</h3>
          <p>
            Pontuação: <strong>{String(result.scorePercent)}%</strong> — casos: {String(result.passedTests)}/
            {String(result.totalTests)}
          </p>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.85rem" }}>{String(result.feedback ?? "")}</pre>
        </div>
      )}
    </Layout>
  );
}