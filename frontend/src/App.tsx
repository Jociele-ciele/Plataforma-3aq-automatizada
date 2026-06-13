import { Routes, Route, Navigate } from "react-router-dom";
import { LandingPage } from "@/pages/Inicio";
import { LoginPage } from "@/pages/auth/Login";
import { RegisterPage } from "@/pages/auth/Cadastro";
import { AppLayout } from "@/pages/AppLayout";
import { CandidatoDashboard } from "@/pages/Dashboard/CandidatoDashboard";
import { RecrutadorDashboard } from "@/pages/Dashboard/RecrutadorDashboard";
import { JobsListPage } from "@/pages/vagas/JobsList";
import { JobDetailsPage } from "@/pages/vagas/JobDetails";
import { JobCreatePage } from "@/pages/vagas/JobCreate";
import { MyJobsPage } from "@/pages/vagas/MyJobs";
import { MyApplicationsPage } from "@/pages/applications/MyApplications";
import { ApplicationDetailsPage } from "@/pages/applications/ApplicationDetails";
import { ChallengeRunnerPage } from "@/pages/desafios/ChallengeRunner";
import { RankingPage } from "@/pages/ranking/Ranking";
import { ProfilePage } from "@/pages/perfil/Profile";
import { ProtectedRoute } from "@/components/RotaProtegida";
import { useAuthStore } from "@/store/auth";

function HomeByRole() {
  const { user } = useAuthStore();
  if (user?.role === "RECRUTADOR") return <RecrutadorDashboard />;
  return <CandidatoDashboard />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/app" element={<HomeByRole />} />
          <Route path="/app/vagas" element={<JobsListPage />} />
          <Route path="/app/vagas/:id" element={<JobDetailsPage />} />
          <Route path="/app/perfil" element={<ProfilePage />} />
          <Route path="/app/inscricoes/:id" element={<ApplicationDetailsPage />} />
          <Route path="/app/inscricoes/:id/desafio/:challengeId" element={<ChallengeRunnerPage />} />

          {/* só Candidato */}
          <Route element={<ProtectedRoute roles={["CANDIDATO"]} />}>
            <Route path="/app/minhas-inscricoes" element={<MyApplicationsPage />} />
          </Route>

          {/* só Recrutador */}
          <Route element={<ProtectedRoute roles={["RECRUTADOR"]} />}>
            <Route path="/app/minhas-vagas" element={<MyJobsPage />} />
            <Route path="/app/vagas/nova" element={<JobCreatePage />} />
            <Route path="/app/vagas/:id/ranking" element={<RankingPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
