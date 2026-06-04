import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Code2,
  ListChecks,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Github,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/interface/button";
import { Badge } from "@/components/interface/badge";
import { Progress } from "@/components/interface/progress";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/interface/card";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { formatDate } from "@/lib/utils";

interface ApplicationDetail {
  id: string;
  status: string;
  notaFinal: number;
  scoreCurriculo: number;
  scoreGithub: number;
  scoreDesafios: number;
  resumoIA: string | null;
  feedback: string | null;
  createdAt: string;
  vaga: {
    id: string;
    titulo: string;
    tecnologias: string[];
    recrutador: { id: string; nome: string };
  };
  candidato: {
    id: string;
    nome: string;
    email: string;
    github: string | null;
    githubAnalysis: { score: number; tecnologias: string[] } | null;
  };
  submissions: {
    id: string;
    nota: number;
    challenge: { id: string; tipo: string; enunciado: string };
  }[];
}

export function ApplicationDetailsPage() {
  const { id = "" } = useParams();
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<ApplicationDetail>({
    queryKey: ["application", id],
    queryFn: async () => (await api.get(`/applications/${id}`)).data,
  });

  const setStatus = useMutation({
    mutationFn: async (input: { status: "APROVADO" | "REPROVADO"; feedback?: string }) =>
      (await api.put(`/applications/${id}/status`, input)).data,
    onSuccess: () => {
      toast.success("Status atualizado");
      qc.invalidateQueries({ queryKey: ["application", id] });
    },
  });

  const refresh = useMutation({
    mutationFn: async () => (await api.post(`/applications/${id}/refresh-score`)).data,
    onSuccess: () => {
      toast.success("Nota recalculada");
      qc.invalidateQueries({ queryKey: ["application", id] });
    },
  });

  if (isLoading || !data) {
    return <div className="h-96 shimmer rounded-2xl border border-border/40" />;
  }

  const ehRecrutador =
    user?.role === "RECRUTADOR" && data.vaga.recrutador.id === user.id;

  const desafiosFeitos = new Set(data.submissions.map((s) => s.challenge.id));

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link to={user?.role === "CANDIDATO" ? "/app/minhas-inscricoes" : `/app/vagas/${data.vaga.id}/ranking`}>
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardContent className="pt-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <Badge variant={
                  data.status === "APROVADO" ? "success" :
                  data.status === "REPROVADO" ? "destructive" : "warning"
                }>{data.status}</Badge>
                <h1 className="text-3xl md:text-4xl font-extrabold mt-2">
                  {data.vaga.titulo}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Candidato:{" "}
                  <span className="font-medium text-foreground">
                    {data.candidato.nome}
                  </span>{" "}
                  · Inscrito em {formatDate(data.createdAt)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Nota final</p>
                <p className="text-5xl font-extrabold gradient-text">
                  {data.notaFinal}
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 mt-6">
              {[
                { l: "Currículo (IA)", v: data.scoreCurriculo, peso: "30%" },
                { l: "GitHub", v: data.scoreGithub, peso: "20%" },
                { l: "Desafios", v: data.scoreDesafios, peso: "50%" },
              ].map((s) => (
                <div
                  key={s.l}
                  className="rounded-xl border border-border/50 p-4"
                >
                  <p className="text-xs text-muted-foreground">
                    {s.l} <span className="opacity-70">({s.peso})</span>
                  </p>
                  <p className="text-2xl font-extrabold mt-1">{Math.round(s.v)}</p>
                  <Progress value={s.v} className="mt-2" />
                </div>
              ))}
            </div>

            {ehRecrutador && (
              <div className="flex flex-wrap gap-2 mt-6">
                <Button
                  variant="default"
                  onClick={() => setStatus.mutate({ status: "APROVADO" })}
                >
                  <ThumbsUp className="h-4 w-4" /> Aprovar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setStatus.mutate({ status: "REPROVADO" })}
                >
                  <ThumbsDown className="h-4 w-4" /> Reprovar
                </Button>
                <Button variant="outline" onClick={() => refresh.mutate()}>
                  <Sparkles className="h-4 w-4" /> Recalcular nota
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {data.resumoIA && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" /> Resumo gerado pela IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{data.resumoIA}</p>
          </CardContent>
        </Card>
      )}

      {data.candidato.githubAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="h-5 w-5" /> GitHub
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">
              Score:{" "}
              <span className="font-bold gradient-text text-lg">
                {data.candidato.githubAnalysis.score}
              </span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {data.candidato.githubAnalysis.tecnologias.map((t) => (
                <Badge key={t} variant="secondary">
                  {t}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="h-5 w-5" /> Desafios da vaga
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.submissions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum teste feito ainda.
            </p>
          ) : null}
          <div className="space-y-3">
            {data.submissions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-xl border border-border/50 p-3"
              >
                <div className="flex items-center gap-3">
                  {s.challenge.tipo === "CODIGO_JS" ? (
                    <Code2 className="h-4 w-4 text-primary" />
                  ) : (
                    <FileText className="h-4 w-4 text-fuchsia-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium line-clamp-1">
                      {s.challenge.enunciado}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {s.challenge.tipo === "CODIGO_JS" ? "Código JS" : "Múltipla escolha"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-2xl gradient-text">{s.nota}</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </div>
              </div>
            ))}
          </div>

          {user?.role === "CANDIDATO" && (
            <div className="mt-4">
              <DesafiosPendentes
                applicationId={data.id}
                vagaId={data.vaga.id}
                jaFeitos={desafiosFeitos}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DesafiosPendentes({
  applicationId,
  vagaId,
  jaFeitos,
}: {
  applicationId: string;
  vagaId: string;
  jaFeitos: Set<string>;
}) {
  const { data = [] } = useQuery<{ id: string; tipo: string; enunciado: string }[]>({
    queryKey: ["challenges-vaga", vagaId],
    queryFn: async () => (await api.get(`/challenges/by-job/${vagaId}`)).data,
  });

  const pendentes = data.filter((c) => !jaFeitos.has(c.id));
  if (pendentes.length === 0) return null;

  return (
    <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
      <p className="font-semibold mb-2">
        Desafios que faltam: {pendentes.length}
      </p>
      <div className="space-y-2">
        {pendentes.map((c) => (
          <Link
            key={c.id}
            to={`/app/inscricoes/${applicationId}/desafio/${c.id}`}
            className="flex items-center justify-between rounded-lg bg-background/60 px-3 py-2 hover:bg-background transition-colors"
          >
            <div>
              <Badge variant="default" className="text-xs">
                {c.tipo === "CODIGO_JS" ? "Código JS" : "Múltipla escolha"}
              </Badge>
              <p className="text-sm mt-1 line-clamp-1">{c.enunciado}</p>
            </div>
            <Button size="sm" variant="gradient">
              Fazer
            </Button>
          </Link>
        ))}
      </div>
    </div>
  );
}
