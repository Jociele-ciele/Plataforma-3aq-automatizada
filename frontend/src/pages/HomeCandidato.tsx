import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import Layout from "../components/layout";

type Me = {
  perfil_candidato: null | {
    nota_tecnica: number | null;
    nota_compatibilidade: number | null;
    texto_extraido_cv: string | null;
  };
};

export default function HomeCandidato() {
  const [me, setMe] = useState<Me | null>(null);
  const [analise, setAnalise] = useState<Record<string, unknown> | null>(null);
  const [gh, setGh] = useState<Record<string, unknown> | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function refreshMe() {
    try {
      const { data } = await api.get("/auth/me");
      setMe(data);
    } catch {
      setMe(null);
    }
  }

  useEffect(() => {
    void refreshMe();
  }, []);

  async function runAnalyze() {
    setErr(null);
    try {
      const { data } = await api.post("/candidatos/analisar-cv");
      setAnalise(data);
      await refreshMe();
    } catch (e: unknown) {
      setErr(
        String(
          (e as { response?: { data?: { error?: string } } }).response?.data
            ?.error ?? e,
        ),
      );
    }
  }

  async function runGithub() {
    setErr(null);
    try {
      const { data } = await api.post("/github/analisar", {});
      setGh(data);
      await refreshMe();
    } catch (e: unknown) {
      setErr(
        String(
          (e as { response?: { data?: { error?: string } } }).response?.data
            ?.error ?? e,
        ),
      );
    }
  }

  const p = me?.perfil_candidato;

  return (
    <Layout>
      <h1 style={{ marginTop: 0 }}>Painel do candidato</h1>
      <p className="muted">
        Utilize o fluxo: vagas → candidatura → teste. Triagem IA e GitHub são
        opcionais por candidatura/vaga.
      </p>

      <div className="grid grid-2" style={{ marginTop: "1.5rem" }}>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Estado do perfil</h3>
          <p className="muted">
            Score técnico (IA): <strong>{p?.nota_tecnica ?? "—"}</strong>
            <br />
            Adequação à vaga:{" "}
            <strong>{p?.nota_compatibilidade ?? "—"}</strong>
          </p>
          <p className="muted" style={{ fontSize: "0.85rem" }}>
            Envie um ficheiro .txt como CV no protótipo (ou pipeline PDF em
            produção). O seed já inclui texto de exemplo para teste rápido.
          </p>
          <button
            type="button"
            onClick={runAnalyze}
            style={{ marginTop: "0.5rem" }}
          >
            Correr triagem IA
          </button>
        </div>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Portfólio GitHub</h3>
          <button type="button" onClick={runGithub}>
            Analisar repositórios públicos
          </button>
          {gh && (
            <pre
              style={{
                marginTop: "1rem",
                fontSize: "0.8rem",
                overflow: "auto",
                maxHeight: 220,
                background: "#0c1018",
                padding: "0.75rem",
                borderRadius: 8,
              }}
            >
              {JSON.stringify(gh, null, 2)}
            </pre>
          )}
        </div>
      </div>

      {err && (
        <p className="error" style={{ marginTop: "1rem" }}>
          {err}
        </p>
      )}

      {analise && (
        <div className="card" style={{ marginTop: "1rem" }}>
          <h3 style={{ marginTop: 0 }}>Última triagem</h3>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.9rem" }}>
            {JSON.stringify(analise, null, 2)}
          </pre>
        </div>
      )}

      <p style={{ marginTop: "1.5rem" }}>
        <Link to="/candidato/vagas">Ver vagas abertas →</Link>
      </p>
    </Layout>
  );
}
