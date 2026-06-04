import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Award,
  Briefcase,
  Crown,
  PlusCircle,
  Sparkles,
  Star,
  TrendingUp,
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

const CORES_DONUT = ["hsl(263, 90%, 65%)", "hsl(187, 92%, 50%)", "hsl(330, 80%, 60%)"];

const PERIODOS = [
  { id: "30", label: "Últimos 30 dias" },
  { id: "90", label: "Últimos 3 meses" },
  { id: "180", label: "Este semestre" },
] as const;

type PeriodoId = (typeof PERIODOS)[number]["id"];

export function RecrutadorDashboard() {
  const { user } = useAuthStore();
  const [periodo, setPeriodo] = useState<PeriodoId>("180");

  const { data, isLoading } = useQuery<Dashboard>({
    queryKey: ["dashboard-recrutador"],
    queryFn: async () =>
      (await api.get<Dashboard>("/ranking/dashboard/recrutador")).data,
  });

  // Filtra a série de inscrições por mês de acordo com o período escolhido
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
      label: "Total de vagas",
      v: data.totalVagas,
      delta: data.tendencias.vagas,
      icon: Briefcase,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Vagas abertas",
      v: data.vagasAbertas,
      delta: data.tendencias.abertas,
      icon: Sparkles,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Candidatos",
      v: data.totalCandidatos,
      delta: data.tendencias.candidatos,
      icon: Users,
      color: "text-fuchsia-500",
      bg: "bg-fuchsia-500/10",
    },
    {
      label: "Média de notas",
      v: data.mediaNotas,
      delta: data.tendencias.media,
      icon: TrendingUp,
      color: "text-accent",
      bg: "bg-accent/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end md:justify-between gap-3"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Painel de {user?.nome.split(" ")[0]}
          </h1>
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

      {/* Grid Superior — métricas avançadas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const positivo = s.delta >= 0;
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="card-hover relative overflow-hidden">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`h-10 w-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center`}
                    >
                      <s.icon className="h-5 w-5" />
                    </div>
                    <span
                      className={`flex items-center gap-1 text-xs font-bold rounded-full px-2 py-0.5 ${
                        positivo
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {positivo ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {Math.abs(s.delta)}%
                    </span>
                  </div>
                  <p className="text-3xl font-extrabold">{s.v}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-2">
                    vs. 30 dias anteriores
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Bloco analítico em duas colunas */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Coluna esquerda — gráfico principal */}
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
              <div className="h-[260px] flex items-center justify-center text-sm text-muted-foreground">
                Sem inscrições no período selecionado.
              </div>
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

        {/* Coluna direita — donut com total centralizado */}
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
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: 12 }}
                  />
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

      {/* Seção inferior larga — Top 5 + Atividades recentes */}
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
              <p className="text-sm text-muted-foreground py-6 text-center">
                Ainda não há candidatos suficientes para o ranking.
              </p>
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

        {/* Timeline de atividades recentes */}
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
              <p className="text-sm text-muted-foreground py-6 text-center">
                Sem atividade no momento.
              </p>
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
                      <span className="text-muted-foreground">
                        se inscreveu em
                      </span>{" "}
                      <span className="font-medium">{a.vaga.titulo}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {tempoRelativo(a.createdAt)} · nota {a.notaFinal}
                    </p>
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

// Converte data ISO em texto relativo amigável.
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
