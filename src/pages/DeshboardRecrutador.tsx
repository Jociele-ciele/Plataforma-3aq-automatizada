import { useEffect, useState } from "react";
import { api } from "../api/client";
import Layout from "../components/layout";

type Row = {
  id: string;
  status: string;
  rankingScore: number;
  job: { title: string };
  candidate: { user: { name: string; email: string } };
  submissions: { scorePercent: number }[];
};
export default function DashboardRecrutador() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    api.get("/applications/pipeline").then((r) => setRows(r.data));
  }, []);

  return (
    <Layout>
      <h1 style={{ marginTop: 0 }}>Pipeline e ranking (RN04)</h1>
      <p className="muted">
        Ordenação por pontuação técnica composta (teste + IA + GitHub no
        protótipo).
      </p>

      <div className="table-wrap" style={{ marginTop: "1rem" }}>
        <table>
          <thead>
            <tr>
              <th>Candidato</th>
              <th>Vaga</th>
              <th>Estado</th>
              <th>Melhor teste %</th>
              <th>Score ranking</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id}>
                <td>
                  {a.candidate.user.name}
                  <div className="muted" style={{ fontSize: "0.8rem" }}>
                    {a.candidate.user.email}
                  </div>
                </td>
                <td>{a.job.title}</td>
                <td>{a.status}</td>
                <td>
                  {a.submissions.length
                    ? Math.max(...a.submissions.map((s) => s.scorePercent))
                    : "—"}
                </td>
                <td>
                  <strong>{a.rankingScore}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <p className="muted">Sem candidaturas nas suas vagas.</p>
      )}
    </Layout>
  );
}
