import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Crown, GitBranch, Trophy } from "lucide-react";

import { Card, CardContent } from "@/components/interface/card";
import { Avatar, AvatarFallback } from "@/components/interface/avatar";
import { Badge } from "@/components/interface/badge";
import { Button } from "@/components/interface/button";
import { Progress } from "@/components/interface/progress";
import { api } from "@/lib/api";
import { initials } from "@/lib/utils";

interface Item {
  posicao: number;
  applicationId: string;
  candidato: { id: string; nome: string; github: string | null };
  notaFinal: number;
  scoreCurriculo: number;
  scoreGithub: number;
  scoreDesafios: number;
  status: string;
  medalha: "ouro" | "prata" | "bronze" | null;
}

const COR_MEDALHA = {
  ouro: "from-yellow-400 to-amber-500",
  prata: "from-slate-300 to-slate-500",
  bronze: "from-orange-400 to-amber-700",
};

export function RankingPage() {
  const { id = "" } = useParams();

  const { data = [], isLoading } = useQuery<Item[]>({
    queryKey: ["ranking", id],
    queryFn: async () => (await api.get(`/ranking/job/${id}`)).data,
  });

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link to="/app/minhas-vagas">
          <ArrowLeft className="h-4 w-4" /> Voltar para minhas vagas
        </Link>
      </Button>

      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-2">
          <Trophy className="h-8 w-8 text-amber-500" /> Ranking de candidatos
        </h1>
        <p className="text-muted-foreground">
          Classificação automática pelas notas técnicas dos candidatos.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-2xl shimmer bg-card/40 border border-border/40"
            />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          Ainda não há candidatos inscritos nesta vaga.
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((c, i) => (
            <motion.div
              key={c.applicationId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link to={`/app/inscricoes/${c.applicationId}`}>
                <Card className="card-hover overflow-hidden">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {initials(c.candidato.nome)}
                          </AvatarFallback>
                        </Avatar>
                        {c.medalha && (
                          <div
                            className={`absolute -top-2 -right-2 rounded-full p-1 bg-gradient-to-br ${COR_MEDALHA[c.medalha]}`}
                          >
                            <Crown className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-muted-foreground font-bold w-7 text-center">
                            #{c.posicao}
                          </span>
                          <p className="font-semibold truncate">{c.candidato.nome}</p>
                          {c.candidato.github && (
                            <Badge variant="outline" className="gap-1 text-[10px]">
                              <GitBranch className="h-3 w-3" />
                              {c.candidato.github}
                            </Badge>
                          )}
                          <Badge
                            variant={
                              c.status === "APROVADO" ? "success" :
                              c.status === "REPROVADO" ? "destructive" : "warning"
                            }
                            className="text-[10px]"
                          >
                            {c.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-3 mt-2 text-xs">
                          <div>
                            <p className="text-muted-foreground">CV (IA)</p>
                            <Progress value={c.scoreCurriculo} className="mt-1 h-1.5" />
                          </div>
                          <div>
                            <p className="text-muted-foreground">GitHub</p>
                            <Progress value={c.scoreGithub} className="mt-1 h-1.5" />
                          </div>
                          <div>
                            <p className="text-muted-foreground">Desafios</p>
                            <Progress value={c.scoreDesafios} className="mt-1 h-1.5" />
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Nota</p>
                        <p className="text-3xl font-extrabold gradient-text">
                          {c.notaFinal}
                        </p>
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
