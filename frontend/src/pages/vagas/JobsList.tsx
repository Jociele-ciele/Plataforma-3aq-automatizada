import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { Search, Briefcase, Users, ArrowRight } from "lucide-react";

import { Card, CardContent } from "@/components/interface/card";
import { Badge } from "@/components/interface/badge";
import { Input } from "@/components/interface/input";
import { Button } from "@/components/interface/button";
import { api } from "@/lib/api";

interface Job {
  id: string;
  titulo: string;
  descricao: string;
  tecnologias: string[];
  senioridade: string;
  status: string;
  recrutador: { nome: string };
  _count: { applications: number; challenges: number };
}

export function JobsListPage() {
  const [busca, setBusca] = useState("");
  const { data = [], isLoading } = useQuery<Job[]>({
    queryKey: ["jobs"],
    queryFn: async () => (await api.get("/jobs?status=ABERTA")).data,
  });

  const filtradas = data.filter(
    (j) =>
      j.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      j.tecnologias.some((t) => t.toLowerCase().includes(busca.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          Vagas <span className="gradient-text">abertas</span>
        </h1>
        <p className="text-muted-foreground">
          Encontre a vaga perfeita e candidate-se em poucos cliques.
        </p>
      </div>

      <div className="relative max-w-xl">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por título ou tecnologia..."
          className="pl-9"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-48 rounded-2xl shimmer bg-card/40 border border-border/40"
            />
          ))}
        </div>
      ) : filtradas.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          Nenhuma vaga encontrada com esse termo.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtradas.map((j, i) => (
            <motion.div
              key={j.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className="card-hover h-full">
                <CardContent className="pt-6 flex flex-col h-full">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-lg leading-tight">{j.titulo}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Por {j.recrutador.nome}
                      </p>
                    </div>
                    <Badge variant="outline">{j.senioridade}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3 line-clamp-3 flex-1">
                    {j.descricao}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {j.tecnologias.slice(0, 5).map((t) => (
                      <Badge key={t} variant="secondary">
                        {t}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/40">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {j._count.applications}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5" />
                        {j._count.challenges} testes
                      </span>
                    </div>
                    <Button asChild size="sm" variant="ghost">
                      <Link to={`/app/vagas/${j.id}`}>
                        Ver detalhes <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
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
