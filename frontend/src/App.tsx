import type { ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/context";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/auth/Login";
import Cadastro from "./pages/auth/Cadastro";
import HomeCandidato from "./pages/HomeCandidato";
import Vagas from "./pages/Vagas";
import DetalhesDaVaga from "./pages/DetalhesDaVaga";
import PageTeste from "./pages/PageTeste";
import DashboardRecrutador from "./pages/Dashboard/RecrutadorDeshboard";
import VagasRecrutador from "./pages/VagasRecrutador";

function Guard({
  role,
  children,
}: {
  role: "CANDIDATE" | "RECRUITER";
  children: ReactNode;
}) {
  const { user, loading } = useAuth();
  if (loading) return <p style={{ padding: 24 }}>Carregando…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/registo" element={<Navigate to="/cadastro" replace />} />

      <Route
        path="/candidato"
        element={
          <Guard role="CANDIDATE">
            <HomeCandidato />
          </Guard>
        }
      />
      <Route
        path="/candidato/vagas"
        element={
          <Guard role="CANDIDATE">
            <Vagas />
          </Guard>
        }
      />
      <Route
        path="/candidato/vagas/:id"
        element={
          <Guard role="CANDIDATE">
            <DetalhesDaVaga />
          </Guard>
        }
      />
      <Route
        path="/candidato/teste/:applicationId/:challengeId"
        element={
          <Guard role="CANDIDATE">
            <PageTeste />
          </Guard>
        }
      />

      <Route
        path="/recrutador"
        element={
          <Guard role="RECRUITER">
            <DashboardRecrutador />
          </Guard>
        }
      />
      <Route
        path="/recrutador/vagas"
        element={
          <Guard role="RECRUITER">
            <VagasRecrutador />
          </Guard>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
