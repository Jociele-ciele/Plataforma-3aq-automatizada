import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/context";
import Layout from "../components/layout";

export default function Cadastro() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [github, setGithub] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await register({
        email,
        password,
        name,
        githubLogin: github.trim() || undefined,
      });
      nav("/candidato");
    } catch {
      setError("Registo falhou. Email já pode estar em uso.");
    }
  }

  return (
    <Layout>
      <div className="card" style={{ maxWidth: 480, margin: "0 auto" }}>
        <h1 style={{ marginTop: 0 }}>Registo de candidato</h1>
        <p className="muted">
          Contas de recrutador são criadas pela equipa (seed/demo). Candidatos
          podem integrar GitHub para análise de portfólio (RF19–20).
        </p>
        <form
          onSubmit={onSubmit}
          className="grid"
          style={{ marginTop: "1rem" }}
        >
          <div>
            <label htmlFor="name">Nome</label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
            />
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password">Palavra-passe (mín. 8)</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div>
            <label htmlFor="gh">GitHub login (opcional)</label>
            <input
              id="gh"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="octocat"
            />
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit">Criar conta</button>
        </form>
        <p className="muted" style={{ marginTop: "1rem" }}>
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </Layout>
  );
}
