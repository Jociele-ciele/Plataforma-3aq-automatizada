import { useEffect, useState } from "react";
import { api } from "../api/client";
import Layout from "../components/layout";

type Linha = {
  id: string;
  status: string;
  pontuacao_ranking: number;
  vaga: { titulo: string };
  candidato: { usuario: { nome: string; email: string } };
  submissoes: { percentual_nota: number }[];
};

export default function DashboardRecrutador() {
  const [linhas, setLinhas] = useState<Linha[]>([]);

  useEffect(() => {
    api.get("/candidaturas/pipeline").then((r) => setLinhas(r.data));
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
            {linhas.map((c) => (
              <tr key={c.id}>
                <td>
                  {c.candidato.usuario.nome}
                  <div className="muted" style={{ fontSize: "0.8rem" }}>
                    {c.candidato.usuario.email}
                  </div>
                </td>
                <td>{c.vaga.titulo}</td>
                <td>{c.status}</td>
                <td>
                  {c.submissoes.length
                    ? Math.max(
                        ...c.submissoes.map((s) => s.percentual_nota),
                      )
                    : "—"}
                </td>
                <td>
                  <strong>{c.pontuacao_ranking}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {linhas.length === 0 && (
        <p className="muted">Sem candidaturas nas suas vagas.</p>
      )}
    </Layout>
  );
}
