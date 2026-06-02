import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, User, Briefcase, Trophy, Home, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/interface/button";
import { Avatar, AvatarFallback } from "@/components/interface/avatar";
import { Logo } from "./Logo";
import { ThemeToggle } from "./AlternarTema";
import { useAuthStore } from "@/store/auth";
import { initials } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function AppHeader() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  if (!user) return null;

  const candidatoLinks = [
    { to: "/app", label: "Início", icon: Home },
    { to: "/app/vagas", label: "Vagas", icon: Briefcase },
    { to: "/app/minhas-inscricoes", label: "Minhas inscrições", icon: FileText },
    { to: "/app/perfil", label: "Perfil", icon: User },
  ];
  const recrutadorLinks = [
    { to: "/app", label: "Painel", icon: Home },
    { to: "/app/vagas", label: "Vagas", icon: Briefcase },
    { to: "/app/minhas-vagas", label: "Gerenciar vagas", icon: Sparkles },
    { to: "/app/perfil", label: "Perfil", icon: User },
  ];
  const links = user.role === "RECRUTADOR" ? recrutadorLinks : candidatoLinks;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border/50"
    >
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/app">
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/app"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/10"
                )
              }
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-full bg-muted/50">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-xs">{initials(user.nome)}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium pr-2">{user.nome.split(" ")[0]}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              logout();
              navigate("/login");
            }}
            aria-label="Sair"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
