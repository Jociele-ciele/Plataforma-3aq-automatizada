import { type FormEvent, useEffect, useState } from "react";
import { api } from "../api/client";
import Layout from "../components/layout";

type Vaga = {
  id: string;
  titulo: string;
  aberta: boolean;
  _count: { candidaturas: number };
};

export default function VagasRecrutador() {
  const [vagas, setVagas] = useState<Vaga[]>([]);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tecnologias, setTecnologias] = useState("javascript, react, node");

  async function recarregar() {
    const { data } = await api.get("/vagas/admin/all");
    setVagas(data);
  }

  useEffect(() => {
    void recarregar();
  }, []);

  async function criarVaga(e: FormEvent) {
    e.preventDefault();
    const lista = tecnologias
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    await api.post("/vagas", {
      titulo,
      descricao,
      tecnologias: lista,
    });
    setTitulo("");
    setDescricao("");
    await recarregar();
  }

  return (
    <Layout>
      <h1 style={{ marginTop: 0 }}>Vagas (RF21)</h1>

      <div className="grid grid-2" style={{ alignItems: "start" }}>
        <form className="card" onSubmit={criarVaga}>
          <h3 style={{ marginTop: 0 }}>Nova vaga</h3>
          <div>
            <label htmlFor="t">Título</label>
            <input
              id="t"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
            />
          </div>
          <div style={{ marginTop: "0.75rem" }}>
            <label htmlFor="d">Descrição</label>
            <textarea
              id="d"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              required
            />
          </div>
          <div style={{ marginTop: "0.75rem" }}>
            <label htmlFor="s">Stack (separada por vírgulas)</label>
            <input
              id="s"
              value={tecnologias}
              onChange={(e) => setTecnologias(e.target.value)}
            />
          </div>
          <button type="submit" style={{ marginTop: "1rem" }}>
            Guardar vaga
          </button>
          <p className="muted" style={{ fontSize: "0.85rem", marginBottom: 0 }}>
            Desafios de código podem ser adicionados via API/Prisma no
            protótipo; o seed inclui um desafio na vaga demo.
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
                {vagas.map((v) => (
                  <tr key={v.id}>
                    <td>{v.titulo}</td>
                    <td>{v._count.candidaturas}</td>
                    <td>{v.aberta ? "sim" : "não"}</td>
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
