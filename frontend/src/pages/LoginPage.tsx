import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/context";
import Layout from "../components/layout";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const u = await login(email, password);
      nav(u.role === "RECRUITER" ? "/recrutador" : "/candidato");
    } catch {
      setError("Não foi possível entrar. Verifique as credenciais.");
    }
  }

  return (
    <Layout>
      <div className="card" style={{ maxWidth: 420, margin: "0 auto" }}>
        <h1 style={{ marginTop: 0 }}>Entrar</h1>
        <p className="muted">Acesso a candidatos e recrutadores (perfis distintos).</p>
        <form onSubmit={onSubmit} className="grid" style={{ marginTop: "1rem" }}>
          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          <div>
            <label htmlFor="password">Palavra-passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit">Entrar</button>
        </form>
        <p className="muted" style={{ marginTop: "1rem" }}>
          Novo candidato? <Link to="/cadastro">Criar conta</Link>
        </p>
      </div>
    </Layout>
  );
}
