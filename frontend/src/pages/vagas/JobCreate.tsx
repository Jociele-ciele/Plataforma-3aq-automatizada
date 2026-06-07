import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Save, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/interface/button";
import { Input } from "@/components/interface/input";
import { Textarea } from "@/components/interface/textarea";
import { Label } from "@/components/interface/label";
import { Badge } from "@/components/interface/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/interface/card";
import { api } from "@/lib/api";

const schema = z.object({
  titulo: z.string().min(3),
  descricao: z.string().min(10),
  senioridade: z.enum(["JUNIOR", "PLENO", "SENIOR"]),
});
type FormData = z.infer<typeof schema>;

export function JobCreatePage() {
  const navigate = useNavigate();
  const [tecnologias, setTecnologias] = useState<string[]>([]);
  const [tecInput, setTecInput] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { senioridade: "PLENO" },
  });

  function adicionarTec() {
    const t = tecInput.trim();
    if (t && !tecnologias.includes(t)) {
      setTecnologias([...tecnologias, t]);
    }
    setTecInput("");
  }

  async function onSubmit(data: FormData) {
    if (tecnologias.length === 0) {
      toast.error("Adicione ao menos uma tecnologia");
      return;
    }
    try {
      const { data: vaga } = await api.post("/jobs", { ...data, tecnologias });
      toast.success("Vaga criada! Agora cadastre os desafios.");
      navigate(`/app/vagas/${vaga.id}`);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error ?? "Erro ao criar vaga");
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
          Criar nova <span className="gradient-text">vaga</span>
        </h1>
        <p className="text-muted-foreground">
          Após criar a vaga você poderá adicionar até 5 desafios.
        </p>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" /> Informações da vaga
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-1.5">
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                placeholder="ex.: Desenvolvedor Full-Stack JavaScript"
                {...register("titulo")}
              />
              {errors.titulo && (
                <p className="text-xs text-destructive">{errors.titulo.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                rows={5}
                placeholder="Descreva as responsabilidades, o time e o que esperam do profissional..."
                {...register("descricao")}
              />
              {errors.descricao && (
                <p className="text-xs text-destructive">{errors.descricao.message}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="senioridade">Senioridade</Label>
                <select
                  id="senioridade"
                  className="h-11 w-full rounded-lg border border-input bg-background/50 px-3 text-sm"
                  {...register("senioridade")}
                >
                  <option value="JUNIOR">Júnior</option>
                  <option value="PLENO">Pleno</option>
                  <option value="SENIOR">Sênior</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Tecnologias da vaga</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="ex.: React"
                    value={tecInput}
                    onChange={(e) => setTecInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        adicionarTec();
                      }
                    }}
                  />
                  <Button type="button" onClick={adicionarTec} variant="secondary">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {tecnologias.map((t) => (
                    <Badge key={t} variant="default" className="gap-1">
                      {t}
                      <button
                        type="button"
                        onClick={() =>
                          setTecnologias(tecnologias.filter((x) => x !== t))
                        }
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Salvando..." : "Salvar vaga"} <Save className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
