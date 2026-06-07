import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  PlusCircle,
  Trophy,
  ListChecks,
  Lock,
  Eye,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/interface/button";
import { Badge } from "@/components/interface/badge";
import { Card, CardContent } from "@/components/interface/card";
import { api } from "@/lib/api";

interface Job {
  id: string;
  titulo: string;
  status: string;
  senioridade: string;
  tecnologias: string[];
  _count: { applications: number; challenges: number };
}

export function MyJobsPage() {
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery<Job[]>({
    queryKey: ["my-jobs"],
    queryFn: async () => (await api.get("/jobs/mine")).data,
  });

  const close = useMutation({
    mutationFn: async (id: string) => (await api.post(`/jobs/${id}/close`)).data,
    onSuccess: () => {
      toast.success("Vaga encerrada");
      qc.invalidateQueries({ queryKey: ["my-jobs"] });
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => (await api.delete(`/jobs/${id}`)).data,
    onSuccess: () => {
      toast.success("Vaga excluída");
      qc.invalidateQueries({ queryKey: ["my-jobs"] });
    },
    onError: () => {
      toast.error("Não foi possível excluir esta vaga");
    },
  });

  function confirmarExclusao(j: Job) {
    const ok = window.confirm(
      `Tem certeza que deseja excluir a vaga "${j.titulo}"? Esta ação não pode ser desfeita.`
    );
    if (ok) remove.mutate(j.id);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Gerenciar vagas
          </h1>
          <p className="text-muted-foreground">
            Edite, encerre ou exclua as vagas que você criou.
          </p>
        </div>
        <Button asChild variant="gradient">
          <Link to="/app/vagas/nova">
            <PlusCircle className="h-4 w-4" /> Nova vaga
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-40 rounded-2xl shimmer bg-card/40 border border-border/40"
            />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          Você ainda não criou nenhuma vaga.{" "}
          <Link to="/app/vagas/nova" className="text-primary font-medium underline">
            Criar agora →
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {data.map((j, i) => (
            <motion.div
              key={j.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="card-hover">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-lg">{j.titulo}</h3>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline">{j.senioridade}</Badge>
                        <Badge variant={j.status === "ABERTA" ? "success" : "secondary"}>
                          {j.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {j.tecnologias.slice(0, 4).map((t) => (
                      <Badge key={t} variant="secondary">
                        {t}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/40">
                    <div className="text-xs text-muted-foreground">
                      {j._count.applications} candidatos · {j._count.challenges} desafios
                    </div>
                    <div className="flex gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/app/vagas/${j.id}`}>
                          <Eye className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/app/vagas/${j.id}/ranking`}>
                          <Trophy className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/app/vagas/${j.id}#desafios`}>
                          <ListChecks className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      {j.status === "ABERTA" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => close.mutate(j.id)}
                          title="Encerrar vaga"
                        >
                          <Lock className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => confirmarExclusao(j)}
                        disabled={remove.isPending}
                        title="Excluir vaga"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
