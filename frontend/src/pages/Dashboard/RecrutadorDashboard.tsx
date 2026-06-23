import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Award,
  Briefcase,
  Crown,
  ListChecks,
  PlusCircle,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

import { Avatar, AvatarFallback } from "@/components/interface/avatar";
import { Badge } from "@/components/interface/badge";
import { Button } from "@/components/interface/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/interface/card";
import { api } from "@/lib/api";
import { initials } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";

interface Tendencias {
  vagas: number;
  abertas: number;
  candidatos: number;
  media: number;
}

interface Dashboard {
  totalVagas: number;
  vagasAbertas: number;
  vagasEncerradas: number;
  totalCandidatos: number;
  mediaNotas: number;
  tendencias: Tendencias;
  top5: {
    id: string;
    notaFinal: number;
    scoreCurriculo: number;
    candidato: { id: string; nome: string };
    vaga: { id: string; titulo: string };
  }[];
  distribStatus: { status: string; total: number }[];
  atividadesRecentes: {
    id: string;
    status: string;
    notaFinal: number;
    createdAt: string;
    candidato: { id: string; nome: string };
    vaga: { id: string; titulo: string };
  }[];
  porMes: { mes: string; total: number }[];
}

interface VagaResumo {
  id: string;
  titulo: string;
  status: string;
  senioridade: string;
  _count: { applications: number; challenges: number };
}

const CORES_DONUT = ["hsl(263, 90%, 65%)", "hsl(187, 92%, 50%)", "hsl(330, 80%, 60%)"];

const PERIODOS = [
  { id: "30", label: "Últimos 30 dias" },
  { id: "90", label: "Últimos 3 meses" },
  { id: "180", label: "Este semestre" },
] as const;

type PeriodoId = (typeof PERIODOS)[number]["id"];

const REFETCH_OPTS = {
  refetchInterval: 30_000,
  refetchOnWindowFocus: true,
} as const;

function formatarDelta(delta: number) {
  if (delta === 100) return { label: "Novo", positivo: true };
  if (delta === 0) return { label: "0%", positivo: true };
  return { label: `${Math.abs(delta)}%`, positivo: delta >= 0 };
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    INSCRITO: "Inscrito",
    EM_ANALISE: "Em análise",
    APROVADO: "Aprovado",
    REPROVADO: "Reprovado",
    ABERTA: "Aberta",
    ENCERRADA: "Encerrada",
    RASCUNHO: "Rascunho",
  };
  return map[status] ?? status;
}

function statusVariant(
  status: string
): "default" | "secondary" | "success" | "warning" | "destructive" {
  if (status === "APROVADO" || status === "ABERTA") return "success";
  if (status === "EM_ANALISE" || status === "INSCRITO") return "warning";
  if (status === "REPROVADO") return "destructive";
  return "secondary";
}

export function RecrutadorDashboard() {
  const { user } = useAuthStore();
  const [periodo, setPeriodo] = useState<PeriodoId>("180");

  const { data, isLoading, isFetching } = useQuery<Dashboard>({
    queryKey: ["dashboard-recrutador"],
    queryFn: async () =>
      (await api.get<Dashboard>("/ranking/dashboard/recrutador")).data,
    ...REFETCH_OPTS,
  });

  const { data: minhasVagas = [] } = useQuery<VagaResumo[]>({
    queryKey: ["my-jobs"],
    queryFn: async () => (await api.get("/jobs/mine")).data,
    ...REFETCH_OPTS,
  });

  const serieFiltrada = useMemo(() => {
    if (!data) return [];
    const dias = Number(periodo);
    const limite = new Date();
    limite.setDate(limite.getDate() - dias);
    return data.porMes.filter((p) => {
      const [ano, mes] = p.mes.split("-").map(Number);
      const d = new Date(ano, mes - 1, 1);
      return d >= new Date(limite.getFullYear(), limite.getMonth(), 1);
    });
  }, [data, periodo]);

  const totalDistribStatus = useMemo(
    () => data?.distribStatus.reduce((acc, s) => acc + s.total, 0) ?? 0,
    [data]
  );

  const vagasRecentes = useMemo(() => minhasVagas.slice(0, 5), [minhasVagas]);

  const primeiraVagaComCandidatos = useMemo(
    () =>
      [...minhasVagas].sort(
        (a, b) => b._count.applications - a._count.applications
      )[0],
    [minhasVagas]
  );

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

  const linkCandidatos = primeiraVagaComCandidatos
    ? `/app/vagas/${primeiraVagaComCandidatos.id}/ranking`
    : "/app/minhas-vagas";

  const stats = [
    {
      label: "Total de vagas",
      v: data.totalVagas,
      delta: data.tendencias.vagas,
      icon: Briefcase,
      color: "text-primary",
      bg: "bg-primary/10",
      to: "/app/minhas-vagas",
    },
    {
      label: "Vagas abertas",
      v: data.vagasAbertas,
      delta: data.tendencias.abertas,
      icon: Sparkles,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      to: "/app/minhas-vagas",
    },
    {
      label: "Candidatos",
      v: data.totalCandidatos,
      delta: data.tendencias.candidatos,
      icon: Users,
      color: "text-fuchsia-500",
      bg: "bg-fuchsia-500/10",
      to: linkCandidatos,
    },
    {
      label: "Média de notas",
      v: data.mediaNotas,
      delta: data.tendencias.media,
      icon: TrendingUp,
      color: "text-accent",
      bg: "bg-accent/10",
      to: linkCandidatos,
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
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Painel de {user?.nome.split(" ")[0]}
            </h1>
            {isFetching && (
              <Badge variant="outline" className="text-[10px] animate-pulse">
                Atualizando…
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Visão geral das vagas, candidatos e da inteligência da plataforma.
          </p>
        </div>
        <Button asChild variant="gradient">
          <Link to="/app/vagas/nova">
            <PlusCircle className="h-4 w-4" /> Nova vaga
          </Link>
        </Button>
      </motion.div>

      {/* 2 — Cards clicáveis */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const tendencia = formatarDelta(s.delta);
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={s.to} className="block group">
                <Card className="card-hover relative overflow-hidden h-full transition-all group-hover:border-primary/40">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`h-10 w-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center`}
                      >
                        <s.icon className="h-5 w-5" />
                      </div>
                      <span
                        className={`flex items-center gap-1 text-xs font-bold rounded-full px-2 py-0.5 ${
                          tendencia.positivo
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {tendencia.positivo ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3" />
                        )}
                        {tendencia.label}
                      </span>
                    </div>
                    <p className="text-3xl font-extrabold">{s.v}</p>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-2 flex items-center gap-1">
                      Ver detalhes
                      <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* 3 — Suas vagas agora */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5" /> Suas vagas agora
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Acompanhe candidatos e ranking de cada vaga
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/app/minhas-vagas">Ver todas</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {vagasRecentes.length === 0 ? (
            <PainelVazio
              titulo="Nenhuma vaga criada ainda"
              descricao="Crie sua primeira vaga para começar a receber candidatos e ver o ranking aqui."
              acoes={
                <Button asChild variant="gradient" size="sm">
                  <Link to="/app/vagas/nova">
                    <PlusCircle className="h-4 w-4" /> Criar primeira vaga
                  </Link>
                </Button>
              }
            />
          ) : (
            <div className="space-y-2">
              {vagasRecentes.map((vaga) => (
                <div
                  key={vaga.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-border/50 p-3 hover:bg-card/80 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold truncate">{vaga.titulo}</span>
                      <Badge variant={statusVariant(vaga.status)}>
                        {statusLabel(vaga.status)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {vaga._count.applications} candidato
                      {vaga._count.applications === 1 ? "" : "s"} ·{" "}
                      {vaga._count.challenges} desafio
                      {vaga._count.challenges === 1 ? "" : "s"} · {vaga.senioridade}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/app/vagas/${vaga.id}`}>
                        <Briefcase className="h-3.5 w-3.5" /> Ver vaga
                      </Link>
                    </Button>
                    <Button asChild variant="secondary" size="sm">
                      <Link to={`/app/vagas/${vaga.id}/ranking`}>
                        <Trophy className="h-3.5 w-3.5" /> Ranking
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" /> Inscrições nos últimos meses
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Evolução das candidaturas recebidas
              </p>
            </div>
            <div className="flex flex-wrap gap-1 rounded-full border border-border/60 bg-muted/30 p-1">
              {PERIODOS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPeriodo(p.id)}
                  className={`text-[11px] font-medium rounded-full px-3 py-1 transition-all ${
                    periodo === p.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {serieFiltrada.length === 0 ? (
              <PainelVazio
                titulo="Ainda sem inscrições neste período"
                descricao={
                  data.vagasAbertas > 0
                    ? `Você tem ${data.vagasAbertas} vaga${data.vagasAbertas === 1 ? "" : "s"} aberta${data.vagasAbertas === 1 ? "" : "s"}. Quando candidatos se inscreverem, o gráfico será preenchido automaticamente.`
                    : "Abra uma vaga para começar a receber candidaturas."
                }
                acoes={
                  <div className="flex flex-wrap gap-2 justify-center">
                    {data.vagasAbertas > 0 ? (
                      <Button asChild variant="outline" size="sm">
                        <Link to="/app/minhas-vagas">Ver minhas vagas</Link>
                      </Button>
                    ) : (
                      <Button asChild variant="gradient" size="sm">
                        <Link to="/app/vagas/nova">
                          <PlusCircle className="h-4 w-4" /> Nova vaga
                        </Link>
                      </Button>
                    )}
                  </div>
                }
                compacto
              />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={serieFiltrada}>
                  <defs>
                    <linearGradient id="cor1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(263, 90%, 65%)" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="hsl(263, 90%, 65%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="mes"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="hsl(263, 90%, 65%)"
                    strokeWidth={2.5}
                    fill="url(#cor1)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status das vagas</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Distribuição do funil
            </p>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={data.distribStatus}
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="total"
                    nameKey="status"
                    paddingAngle={4}
                    stroke="none"
                  >
                    {data.distribStatus.map((_, i) => (
                      <Cell key={i} fill={CORES_DONUT[i % CORES_DONUT.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 12,
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center -mt-6">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Total
                </span>
                <span className="text-3xl font-extrabold gradient-text leading-none">
                  {totalDistribStatus}
                </span>
                <span className="text-[10px] text-muted-foreground mt-1">
                  vagas no funil
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" /> Top 5 candidatos
            </CardTitle>
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
              ranking inteligente
            </Badge>
          </CardHeader>
          <CardContent>
            {data.top5.length === 0 ? (
              <PainelVazio
                titulo="Ranking ainda vazio"
                descricao="Assim que candidatos se inscreverem e fizerem os desafios, os melhores aparecerão aqui ordenados por nota."
                acoes={
                  <Button asChild variant="outline" size="sm">
                    <Link to="/app/minhas-vagas">Gerenciar vagas</Link>
                  </Button>
                }
                compacto
              />
            ) : (
              <div className="space-y-2">
                {data.top5.map((c, i) => {
                  const matchIA = Math.round(c.scoreCurriculo);
                  const corMatch =
                    matchIA >= 80
                      ? "success"
                      : matchIA >= 60
                        ? "default"
                        : matchIA >= 40
                          ? "warning"
                          : "destructive";
                  const medalha =
                    i === 0
                      ? "from-yellow-400 to-amber-500"
                      : i === 1
                        ? "from-slate-300 to-slate-500"
                        : i === 2
                          ? "from-orange-400 to-amber-700"
                          : "";
                  return (
                    <Link
                      key={c.id}
                      to={`/app/inscricoes/${c.id}`}
                      className="group flex items-center gap-3 rounded-xl border border-border/50 p-3 hover:bg-card/80 transition-colors"
                    >
                      <div className="relative">
                        <Avatar className="h-11 w-11">
                          <AvatarFallback>
                            {initials(c.candidato.nome)}
                          </AvatarFallback>
                        </Avatar>
                        {medalha && (
                          <div
                            className={`absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-gradient-to-br ${medalha} flex items-center justify-center shadow-md`}
                          >
                            <Crown className="h-2.5 w-2.5 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-muted-foreground font-bold text-xs">
                            #{i + 1}
                          </span>
                          <span className="font-semibold truncate">
                            {c.candidato.nome}
                          </span>
                          <Badge variant={corMatch} className="gap-1 text-[10px]">
                            <Sparkles className="h-3 w-3" />
                            Match IA · {matchIA}%
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {c.vaga.titulo}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          Nota média
                        </p>
                        <p className="text-2xl font-extrabold gradient-text leading-none">
                          {c.notaFinal}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" /> Atividades recentes
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Últimas inscrições recebidas
            </p>
          </CardHeader>
          <CardContent>
            {data.atividadesRecentes.length === 0 ? (
              <PainelVazio
                titulo="Nenhuma atividade recente"
                descricao="As novas inscrições aparecerão aqui em tempo real, com status e nota do candidato."
                acoes={
                  data.vagasAbertas > 0 ? (
                    <Button asChild variant="outline" size="sm">
                      <Link to="/app/vagas">Ver vagas publicadas</Link>
                    </Button>
                  ) : undefined
                }
                compacto
              />
            ) : (
              <ol className="relative space-y-4 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-px before:bg-border">
                {data.atividadesRecentes.map((a) => (
                  <li key={a.id} className="relative pl-10">
                    <span className="absolute left-0 top-0 h-8 w-8 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center ring-4 ring-background">
                      <span className="text-[10px] font-bold">
                        {initials(a.candidato.nome)}
                      </span>
                    </span>
                    <div className="text-sm leading-snug">
                      <Link
                        to={`/app/inscricoes/${a.id}`}
                        className="font-semibold hover:underline"
                      >
                        {a.candidato.nome.split(" ")[0]}
                      </Link>{" "}
                      <span className="text-muted-foreground">se inscreveu em</span>{" "}
                      <span className="font-medium">{a.vaga.titulo}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant={statusVariant(a.status)} className="text-[10px]">
                        {statusLabel(a.status)}
                      </Badge>
                      <p className="text-[11px] text-muted-foreground">
                        {tempoRelativo(a.createdAt)} · nota {a.notaFinal}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PainelVazio({
  titulo,
  descricao,
  acoes,
  compacto = false,
}: {
  titulo: string;
  descricao: string;
  acoes?: ReactNode;
  compacto?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-border/60 bg-muted/10 ${
        compacto ? "py-10 px-4 min-h-[200px]" : "py-12 px-6"
      }`}
    >
      <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
        <Sparkles className="h-6 w-6" />
      </div>
      <p className="font-semibold">{titulo}</p>
      <p className="text-sm text-muted-foreground mt-1 max-w-md">{descricao}</p>
      {acoes && <div className="mt-4">{acoes}</div>}
    </div>
  );
}

function tempoRelativo(iso: string) {
  const data = new Date(iso);
  const diff = Date.now() - data.getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "agora há pouco";
  if (min < 60) return `há ${min} min`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `há ${hrs} h`;
  const dias = Math.floor(hrs / 24);
  if (dias < 30) return `há ${dias} dia${dias === 1 ? "" : "s"}`;
  return data.toLocaleDateString("pt-BR");
}
