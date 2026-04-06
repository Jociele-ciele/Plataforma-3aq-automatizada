import { Link } from "react-router-dom";
import { useAuth } from "../auth/context";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="layout">
      <header className="nav">
        <Link to="/" className="nav-brand" style={{ color: "inherit", textDecoration: "none" }}>
          3aq Talent
        </Link>
        <nav className="nav-links">
          {user ? (
            <>
              {user.role === "CANDIDATE" && (
                <>
                  <Link to="/candidato">Painel</Link>
                  <Link to="/candidato/vagas">Vagas</Link>
                </>
              )}
              {user.role === "RECRUITER" && (
                <>
                  <Link to="/recrutador">Pipeline</Link>
                  <Link to="/recrutador/vagas">Minhas vagas</Link>
                </>
              )}
              <span className="muted">{user.name}</span>
              <button type="button" className="secondary" onClick={logout}>
                Sair
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Entrar</Link>
              <Link to="/cadastro">Cadastro de candidato</Link>
            </>
          )}
        </nav>
      </header>
      {children}
    </div>
  );
}