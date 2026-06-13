import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";

import { Card, CardContent } from "@/components/interface/card";
import { Badge } from "@/components/interface/badge";
import { Progress } from "@/components/interface/progress";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

interface Application {
  id: string;
  status: string;
  notaFinal: number;
  scoreCurriculo: number;
  scoreGithub: number;
  scoreDesafios: number;
  createdAt: string;
  vaga: { id: string; titulo: string; tecnologias: string[]; status: string };
  submissions: { id: string }[];
}

export function MyApplicationsPage() {
  const { data = [], isLoading } = useQuery<Application[]>({
    queryKey: ["my-applications"],
    queryFn: async () => (await api.get("/applications/mine")).data,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          Minhas inscrições
        </h1>
        <p className="text-muted-foreground">
          Acompanhe o status e a nota de cada candidatura.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-2xl shimmer bg-card/40 border border-border/40"
            />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          Você ainda não se inscreveu em nenhuma vaga.{" "}
          <Link to="/app/vagas" className="text-primary font-medium underline">
            Veja as vagas abertas →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link to={`/app/inscricoes/${a.id}`}>
                <Card className="card-hover">
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg">{a.vaga.titulo}</h3>
                          <Badge
                            variant={
                              a.status === "APROVADO"
                                ? "success"
                                : a.status === "REPROVADO"
                                  ? "destructive"
                                  : "warning"
                            }
                          >
                            {a.status === "EM_ANALISE"
                              ? "Em análise"
                              : a.status === "APROVADO"
                                ? "Aprovado"
                                : a.status === "REPROVADO"
                                  ? "Reprovado"
                                  : a.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Inscrito em {formatDate(a.createdAt)}
                          </span>
                          <span>{a.submissions.length} testes feitos</span>
                        </div>
                        <div className="mt-3">
                          <Progress value={a.notaFinal} />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Nota final</p>
                          <p className="text-3xl font-extrabold gradient-text">
                            {a.notaFinal}
                          </p>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
