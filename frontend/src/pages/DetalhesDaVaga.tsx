import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import Layout from "../components/layout";

type Job = {
  id: string;
  title: string;
  description: string;
  stack: string[];
  challenges: { id: string; title: string; starterCode: string }[];
};
export default function DetalhesDaVaga() {
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api.get(`/jobs/${id}`).then((r) => setJob(r.data));
  }, [id]);

  async function apply() {
    if (!job) return;
    setMsg(null);
    try {
      const { data } = await api.post("/applications", { jobId: job.id });
      setApplicationId(data.id);
      setMsg("Candidatura registada. Pode abrir o teste técnico.");
    } catch (e: unknown) {
      const er = (e as { response?: { data?: { error?: string } } }).response?.data?.error;
      setMsg(er ?? "Falha na candidatura");
    }
  }

  if (!job) return <Layout><p className="muted">A carregar…</p></Layout>;

  const ch = job.challenges[0];

  return (
    <Layout>
      <p>
        <Link to="/candidato/vagas">← Voltar</Link>
      </p>
      <h1 style={{ marginTop: 0 }}>{job.title}</h1>
      <p style={{ whiteSpace: "pre-wrap" }}>{job.description}</p>
      <p className="muted">Stack: {job.stack.join(", ")}</p>

      <div className="card" style={{ marginTop: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Candidatura</h3>
        <button type="button" className="secondary" onClick={apply}>
          Candidatar-me
        </button>
        {msg && <p className="muted" style={{ marginTop: "0.75rem" }}>{msg}</p>}
        {applicationId && ch && (
          <p style={{ marginTop: "1rem" }}>
            <Link to={`/candidato/teste/${applicationId}/${ch.id}`}>
              <button type="button">Abrir teste: {ch.title}</button>
            </Link>
          </p>
        )}
      </div>
    </Layout>
  );
}