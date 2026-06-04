import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Code2,
  Github,
  ListChecks,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";

import { Button } from "@/components/interface/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/interface/card";
import { Badge } from "@/components/interface/badge";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

interface DesafioResolvido {
  submissionId: string;
  challengeId: string;
  tipo: "CODIGO_JS" | "MULTIPLA_ESCOLHA" | string;
  enunciado: string;
  peso: number;
  vaga: { id: string; titulo: string };
  nota: number;
  createdAt: string;
}

interface Dashboard {
  vagasAbertas: number;
  totalInscricoes: number;
  aprovadas: number;
  reprovadas: number;
  emAnalise: number;
  mediaNotas: number;
  githubScore: number;
  mediaDesafios: number;
  desafiosResolvidos: DesafioResolvido[];
  historico: {
    id: string;
    notaFinal: number;
    status: string;
    createdAt: string;
    vaga: { id: string; titulo: string };
  }[];
}

export function CandidatoDashboard() {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery<Dashboard>({
    queryKey: ["dashboard-candidato"],
    queryFn: async () =>
      (await api.get<Dashboard>("/ranking/dashboard/candidato")).data,
  });

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-40 rounded-2xl shimmer bg-card/40 border border-border/40"
          />
        ))}
      </div>
    );
  }

  const stats = [
    {
      label: "Vagas abertas",
      v: data.vagasAbertas,
      icon: Briefcase,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Minhas inscrições",
      v: data.totalInscricoes,
      icon: Sparkles,
      color: "text-fuchsia-500",
      bg: "bg-fuchsia-500/10",
    },
    {
      label: "Em análise",
      v: data.emAnalise,
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
    {
      label: "Aprovadas",
      v: data.aprovadas,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end md:justify-between gap-3"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Olá, {user?.nome.split(" ")[0]} 👋
          </h1>
          <p className="text-muted-foreground">
            Confira como estão suas candidaturas e descubra novas vagas.
          </p>
        </div>
        <Button asChild variant="gradient">
          <Link to="/app/vagas">Ver vagas abertas</Link>
        </Button>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="card-hover">
              <CardContent className="pt-6">
                <div className={`h-10 w-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-3`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <p className="text-3xl font-extrabold">{s.v}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" /> Histórico das candidaturas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.historico.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Você ainda não se inscreveu em nenhuma vaga.{" "}
                <Link to="/app/vagas" className="text-primary font-medium underline">
                  Veja as vagas abertas →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {data.historico.map((h) => (
                  <Link
                    key={h.id}
                    to={`/app/inscricoes/${h.id}`}
                    className="flex items-center justify-between rounded-xl border border-border/60 bg-card/40 p-4 hover:bg-card/80 transition-colors"
                  >
                    <div>
                      <p className="font-semibold">{h.vaga.titulo}</p>
                      <p className="text-xs text-muted-foreground">
                        Inscrição em{" "}
                        {new Date(h.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          h.status === "APROVADO"
                            ? "success"
                            : h.status === "REPROVADO"
                              ? "destructive"
                              : "warning"
                        }
                      >
                        {h.status === "EM_ANALISE"
                          ? "Em análise"
                          : h.status === "APROVADO"
                            ? "Aprovado"
                            : h.status === "REPROVADO"
                              ? "Reprovado"
                              : h.status}
                      </Badge>
                      <span className="text-2xl font-extrabold gradient-text">
                        {h.notaFinal}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="h-5 w-5" /> Score do GitHub
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <ResponsiveContainer width="100%" height={200}>
                <RadialBarChart
                  innerRadius="72%"
                  outerRadius="100%"
                  data={[{ name: "github", value: data.githubScore, fill: "url(#g1)" }]}
                  startAngle={90}
                  endAngle={-270}
                >
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="hsl(263, 90%, 65%)" />
                      <stop offset="100%" stopColor="hsl(187, 92%, 50%)" />
                    </linearGradient>
                  </defs>
                  <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    tick={false}
                  />
                  <RadialBar
                    background={{ fill: "hsl(var(--muted))" }}
                    dataKey="value"
                    cornerRadius={100}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold text-foreground leading-none drop-shadow-sm">
                  {data.githubScore}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                  /100
                </span>
              </div>
            </div>
            <p className="text-center text-xs text-muted-foreground mt-2">
              Nota baseada em repositórios, estrelas e atividade
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" /> Pontuação nos desafios
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Suas melhores notas nos testes técnicos das vagas
            </p>
          </div>
          {data.desafiosResolvidos.length > 0 && (
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Média
              </p>
              <p className="text-2xl font-extrabold gradient-text leading-none">
                {data.mediaDesafios}
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {data.desafiosResolvidos.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Você ainda não resolveu nenhum desafio.{" "}
              <Link to="/app/vagas" className="text-primary font-medium underline">
                Inscreva-se em uma vaga →
              </Link>
            </div>
          ) : (
            <div className="grid gap-2 md:grid-cols-2">
              {data.desafiosResolvidos.map((d) => {
                const cor =
                  d.nota >= 80
                    ? "success"
                    : d.nota >= 60
                      ? "default"
                      : d.nota >= 40
                        ? "warning"
                        : "destructive";
                const Icone = d.tipo === "CODIGO_JS" ? Code2 : ListChecks;
                return (
                  <div
                    key={d.submissionId}
                    className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/40 p-3"
                  >
                    <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Icone className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">
                        {d.vaga.titulo}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {d.enunciado}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge variant={cor} className="text-[10px]">
                          {d.tipo === "CODIGO_JS" ? "Código" : "Múltipla escolha"}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          peso {d.peso}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Nota
                      </p>
                      <p className="text-2xl font-extrabold gradient-text leading-none">
                        {d.nota}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
