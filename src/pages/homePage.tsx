import { Link } from "react-router-dom";
import Layout from "../components/layout";

export default function HomePage() {
  return (
    <Layout>
      <div className="grid grid-2" style={{ alignItems: "start" }}>
        <div>
          <h1 style={{ fontSize: "2rem", marginTop: 0 }}>Seleção técnica inteligente</h1>
          <p className="muted" style={{ fontSize: "1.05rem" }}>
            Plataforma unificada: triagem de currículos com IA, testes de código com correção automática, integração
            GitHub e pipeline para RH — alinhada à demanda 3aq e boas práticas LGPD.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "1.25rem" }}>
            <Link to="/cadastro">
              <button type="button">Sou candidato</button>
            </Link>
            <Link to="/login">
              <button type="button" className="secondary">
                Entrar
              </button>
            </Link>
          </div>
        </div>
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Módulos</h3>
          <ul className="muted" style={{ paddingLeft: "1.1rem", marginBottom: 0 }}>
            <li>Cadastro e gestão centralizada</li>
            <li>Triagem IA (serviço Python)</li>
            <li>Testes e correção automática (Node VM — protótipo)</li>
            <li>Relatórios, ranking e feedback imediato</li>
            <li>API GitHub para portfólio público</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}