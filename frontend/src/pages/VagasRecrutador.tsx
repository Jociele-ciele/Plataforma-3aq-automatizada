import { type FormEvent, useEffect, useState } from "react";
import { api } from "../api/client";
import Layout from "../components/layout";

type Job = {
  id: string;
  title: string;
  isOpen: boolean;
  _count: { applications: number };
};

export default function VagasRecrutador() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [stack, setStack] = useState("javascript, react, node");

  async function reload() {
    const { data } = await api.get("/jobs/admin/all");
    setJobs(data);
  }

  useEffect(() => {
    void reload();
  }, []);

  async function createJob(e: FormEvent) {
    e.preventDefault();
    const st = stack
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    await api.post("/jobs", { title, description, stack: st });
    setTitle("");
    setDescription("");
    await reload();
  }

  return (
    <Layout>
      <h1 style={{ marginTop: 0 }}>Vagas (RF21)</h1>

      <div className="grid grid-2" style={{ alignItems: "start" }}>
        <form className="card" onSubmit={createJob}>
          <h3 style={{ marginTop: 0 }}>Nova vaga</h3>
          <div>
            <label htmlFor="t">Título</label>
            <input id="t" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div style={{ marginTop: "0.75rem" }}>
            <label htmlFor="d">Descrição</label>
            <textarea id="d" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          <div style={{ marginTop: "0.75rem" }}>
            <label htmlFor="s">Stack (separada por vírgulas)</label>
            <input id="s" value={stack} onChange={(e) => setStack(e.target.value)} />
          </div>
          <button type="submit" style={{ marginTop: "1rem" }}>
            Guardar vaga
          </button>
          <p className="muted" style={{ fontSize: "0.85rem", marginBottom: 0 }}>
            Desafios de código podem ser adicionados via API/Prisma no protótipo; o seed inclui um desafio na vaga demo.
          </p>
        </form>

        <div>
          <h3>Resumo</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Candidaturas</th>
                  <th>Aberta</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((j) => (
                  <tr key={j.id}>
                    <td>{j.title}</td>
                    <td>{j._count.applications}</td>
                    <td>{j.isOpen ? "sim" : "não"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
