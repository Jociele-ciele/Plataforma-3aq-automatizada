// Formulário inline para o recrutador cadastrar desafios numa vaga.
// (importado dentro de JobDetails se quiser aparecer só para o dono)
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import { Button } from "@/components/interface/button";
import { Input } from "@/components/interface/input";
import { Textarea } from "@/components/interface/textarea";
import { Label } from "@/components/interface/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/interface/card";
import { api } from "@/lib/api";

export function ChallengeForm({ vagaId }: { vagaId: string }) {
  const qc = useQueryClient();
  const [tipo, setTipo] = useState<"MULTIPLA_ESCOLHA" | "CODIGO_JS">("MULTIPLA_ESCOLHA");
  const [enunciado, setEnunciado] = useState("");
  const [peso, setPeso] = useState(1);
  const [alternativas, setAlternativas] = useState([
    { id: "a", texto: "" },
    { id: "b", texto: "" },
    { id: "c", texto: "" },
    { id: "d", texto: "" },
  ]);
  const [respostaCorreta, setRespostaCorreta] = useState("a");
  const [casosTesteJSON, setCasosTesteJSON] = useState(
    `[\n  {"entrada": [[1,2,3]], "saidaEsperada": 6}\n]`
  );

  const criar = useMutation({
    mutationFn: async () => {
      const base: Record<string, unknown> = {
        vagaId,
        tipo,
        enunciado,
        peso,
      };
      if (tipo === "MULTIPLA_ESCOLHA") {
        base.alternativas = alternativas.filter((a) => a.texto.trim());
        base.respostaCorreta = respostaCorreta;
      } else {
        try {
          base.casosTeste = JSON.parse(casosTesteJSON);
        } catch {
          throw new Error("JSON dos casos de teste inválido");
        }
      }
      return (await api.post("/challenges", base)).data;
    },
    onSuccess: () => {
      toast.success("Desafio adicionado!");
      qc.invalidateQueries({ queryKey: ["job", vagaId] });
      setEnunciado("");
    },
    onError: (e: { response?: { data?: { error?: string } }; message?: string }) =>
      toast.error(e.response?.data?.error ?? e.message ?? "Erro ao criar desafio"),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" /> Adicionar desafio
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setTipo("MULTIPLA_ESCOLHA")}
            className={`rounded-lg border p-3 text-sm font-medium transition-all ${
              tipo === "MULTIPLA_ESCOLHA"
                ? "border-primary bg-primary/10"
                : "border-border"
            }`}
          >
            Múltipla escolha
          </button>
          <button
            type="button"
            onClick={() => setTipo("CODIGO_JS")}
            className={`rounded-lg border p-3 text-sm font-medium transition-all ${
              tipo === "CODIGO_JS"
                ? "border-primary bg-primary/10"
                : "border-border"
            }`}
          >
            Código JS
          </button>
        </div>

        <div className="space-y-1.5">
          <Label>Enunciado</Label>
          <Textarea
            rows={3}
            value={enunciado}
            onChange={(e) => setEnunciado(e.target.value)}
            placeholder="Descreva o desafio..."
          />
        </div>

        <div className="space-y-1.5 max-w-[120px]">
          <Label>Peso (1-10)</Label>
          <Input
            type="number"
            min={1}
            max={10}
            value={peso}
            onChange={(e) => setPeso(Number(e.target.value))}
          />
        </div>

        {tipo === "MULTIPLA_ESCOLHA" ? (
          <div className="space-y-2">
            {alternativas.map((alt, i) => (
              <div key={alt.id} className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={respostaCorreta === alt.id}
                  onChange={() => setRespostaCorreta(alt.id)}
                  className="accent-primary"
                />
                <span className="font-bold uppercase w-6">{alt.id})</span>
                <Input
                  value={alt.texto}
                  onChange={(e) => {
                    const novo = [...alternativas];
                    novo[i].texto = e.target.value;
                    setAlternativas(novo);
                  }}
                  placeholder={`Alternativa ${alt.id.toUpperCase()}`}
                />
              </div>
            ))}
            <p className="text-xs text-muted-foreground">
              Marque o radio da resposta correta.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            <Label>Casos de teste (JSON)</Label>
            <Textarea
              rows={6}
              className="font-mono text-xs"
              value={casosTesteJSON}
              onChange={(e) => setCasosTesteJSON(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Formato:{" "}
              <code>{`[ {"entrada": [args], "saidaEsperada": valor} ]`}</code>
            </p>
          </div>
        )}

        <Button
          variant="gradient"
          onClick={() => criar.mutate()}
          disabled={criar.isPending || !enunciado.trim()}
        >
          {criar.isPending ? "Salvando..." : "Adicionar desafio"}
        </Button>
      </CardContent>
    </Card>
  );
}
