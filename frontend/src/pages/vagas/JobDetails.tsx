import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Briefcase,
  CheckCircle2,
  Code2,
  ListChecks,
  Send,
  Trophy,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/interface/button";
import { Badge } from "@/components/interface/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/interface/card";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { ChallengeForm } from "./ChallengeForm";

interface JobDetalhes {
  id: string;
  titulo: string;
  descricao: string;
  tecnologias: string[];
  senioridade: string;
  status: string;
  recrutador: { id: string; nome: string; email: string };
  challenges: { id: string; tipo: string; enunciado: string; peso: number }[];
  _count: { applications: number };
}

export function JobDetailsPage() {
  const { id = "" } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<JobDetalhes>({
    queryKey: ["job", id],
    queryFn: async () => (await api.get(`/jobs/${id}`)).data,
  });

  const { mutate: candidatar, isPending } = useMutation({
    mutationFn: async () => (await api.post(`/applications/job/${id}`)).data,
    onSuccess: (app) => {
      toast.success("Inscrição enviada! Bora aos testes 🚀");
      qc.invalidateQueries({ queryKey: ["dashboard-candidato"] });
      navigate(`/app/inscricoes/${app.id}`);
    },
    onError: (e: { response?: { data?: { error?: string } } }) =>
      toast.error(e.response?.data?.error ?? "Não foi possível se inscrever"),
  });

  if (isLoading || !data) {
    return <div className="h-96 shimmer rounded-2xl border border-border/40" />;
  }

  const ehRecrutadorDono = user?.role === "RECRUTADOR" && data.recrutador.id === user.id;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link to="/app/vagas">
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
              <div className="space-y-2">
                <Badge variant="outline">{data.senioridade}</Badge>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                  {data.titulo}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Recrutador: <span className="font-medium">{data.recrutador.nome}</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                {user?.role === "CANDIDATO" && data.status === "ABERTA" && (
                  <Button
                    variant="gradient"
                    size="lg"
                    onClick={() => candidatar()}
                    disabled={isPending}
                  >
                    {isPending ? "Inscrevendo..." : "Quero me candidatar"}{" "}
                    <Send className="h-4 w-4" />
                  </Button>
                )}
                {ehRecrutadorDono && (
                  <Button asChild variant="gradient" size="lg">
                    <Link to={`/app/vagas/${id}/ranking`}>
                      <Trophy className="h-4 w-4" /> Ver ranking
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 mt-6">
              <div className="rounded-xl border border-border/50 p-4">
                <Users className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground mt-1">Candidatos</p>
                <p className="font-bold text-2xl">{data._count.applications}</p>
              </div>
              <div className="rounded-xl border border-border/50 p-4">
                <ListChecks className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground mt-1">Desafios</p>
                <p className="font-bold text-2xl">{data.challenges.length}</p>
              </div>
              <div className="rounded-xl border border-border/50 p-4">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground mt-1">Status</p>
                <Badge
                  variant={data.status === "ABERTA" ? "success" : "secondary"}
                  className="mt-1"
                >
                  {data.status}
                </Badge>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <h3 className="font-semibold">Descrição da vaga</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {data.descricao}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {data.tecnologias.map((t) => (
                  <Badge key={t} variant="secondary">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5" /> Etapas do processo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.challenges.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Esta vaga ainda não tem desafios cadastrados.
            </p>
          ) : (
            data.challenges.map((c, i) => (
              <div
                key={c.id}
                className="flex items-start gap-3 rounded-xl border border-border/50 p-3"
              >
                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={c.tipo === "CODIGO_JS" ? "default" : "secondary"}>
                      {c.tipo === "CODIGO_JS" ? "Código JS" : "Múltipla escolha"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Peso {c.peso}</span>
                  </div>
                  <p className="text-sm mt-1 line-clamp-2">{c.enunciado}</p>
                </div>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {ehRecrutadorDono && data.challenges.length < 5 && (
        <ChallengeForm vagaId={data.id} />
      )}
    </div>
  );
}
