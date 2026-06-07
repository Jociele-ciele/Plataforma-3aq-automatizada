import { Outlet } from "react-router-dom";
import { AppHeader } from "@/components/CabecalhoApp";
import { BackgroundDeco } from "@/components/DecoracaoFundo";

export function AppLayout() {
  return (
    <div className="min-h-screen relative">
      <BackgroundDeco />
      <AppHeader />
      <main className="container py-8">
        <Outlet />
      </main>
    </div>
  );
}
