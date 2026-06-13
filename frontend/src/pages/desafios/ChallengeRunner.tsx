import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Code2,
  Play,
  Sparkles,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/interface/button";
import { Badge } from "@/components/interface/badge";
import { Textarea } from "@/components/interface/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/interface/card";
import { api } from "@/lib/api";

interface Challenge {
  id: string;
  tipo: "CODIGO_JS" | "MULTIPLA_ESCOLHA";
  enunciado: string;
  alternativas?: { id: string; texto: string }[];
  exemplos?: { entrada: unknown; saida: unknown }[];
  casosTesteExemplo?: { entrada: unknown[]; saidaEsperada: unknown }[];
  peso: number;
}

interface SubmissionResp {
  nota: number;
  detalhes: {
    erroSintaxe?: string;
    resultados?: {
      passou: boolean;
      entrada: unknown[];
      esperado: unknown;
      recebido: unknown;
      erro?: string;
    }[];
    correta?: string;
    acertou?: boolean;
  };
}

const CODIGO_BASE = `// Implemente a função abaixo. Não remova a palavra-chave 'function solve'.
function solve(input) {
  // seu código aqui
  return null;
}
`;

export function ChallengeRunnerPage() {
  const { id: applicationId = "", challengeId = "" } = useParams();

  const { data: challenge, isLoading } = useQuery<Challenge>({
    queryKey: ["challenge", challengeId],
    queryFn: async () => (await api.get(`/challenges/${challengeId}`)).data,
  });

  const [codigo, setCodigo] = useState(CODIGO_BASE);
  const [resposta, setResposta] = useState<string>("");
  const [resultado, setResultado] = useState<SubmissionResp | null>(null);

  const submeter = useMutation({
    mutationFn: async () =>
      (
        await api.post<SubmissionResp>(`/challenges/${challengeId}/submit`, {
          codigo: challenge?.tipo === "CODIGO_JS" ? codigo : undefined,
          resposta: challenge?.tipo === "MULTIPLA_ESCOLHA" ? resposta : undefined,
          applicationId,
        })
      ).data,
    onSuccess: (r) => {
      setResultado(r);
      toast.success(`Sua nota: ${r.nota}`);
      // recalcula a nota final da inscrição
      api.post(`/applications/${applicationId}/refresh-score`).catch(() => null);
    },
    onError: (e: { response?: { data?: { error?: string } } }) =>
      toast.error(e.response?.data?.error ?? "Erro ao submeter"),
  });

  if (isLoading || !challenge) {
    return <div className="h-96 shimmer rounded-2xl border border-border/40" />;
  }

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <Button asChild variant="ghost" size="sm">
        <Link to={`/app/inscricoes/${applicationId}`}>
          <ArrowLeft className="h-4 w-4" /> Voltar para inscrição
        </Link>
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge>
                {challenge.tipo === "CODIGO_JS" ? "Código JavaScript" : "Múltipla escolha"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Peso {challenge.peso}
              </span>
            </div>
            <CardTitle className="text-2xl">{challenge.enunciado}</CardTitle>
          </CardHeader>
          <CardContent>
            {challenge.tipo === "CODIGO_JS" ? (
              <CodigoJS
                codigo={codigo}
                setCodigo={setCodigo}
                exemplos={challenge.exemplos}
                exemplosTeste={challenge.casosTesteExemplo}
              />
            ) : (
              <MultiplaEscolha
                alternativas={challenge.alternativas ?? []}
                resposta={resposta}
                setResposta={setResposta}
              />
            )}

            <div className="flex justify-end mt-6">
              <Button
                variant="gradient"
                size="lg"
                onClick={() => submeter.mutate()}
                disabled={
                  submeter.isPending ||
                  (challenge.tipo === "MULTIPLA_ESCOLHA" && !resposta)
                }
              >
                {submeter.isPending ? "Avaliando..." : "Submeter resposta"}{" "}
                <Play className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {resultado && <ResultadoSubmissao r={resultado} />}
    </div>
  );
}

function MultiplaEscolha({
  alternativas,
  resposta,
  setResposta,
}: {
  alternativas: { id: string; texto: string }[];
  resposta: string;
  setResposta: (s: string) => void;
}) {
  return (
    <div className="space-y-2">
      {alternativas.map((alt) => (
        <label
          key={alt.id}
          className={`flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-all ${
            resposta === alt.id
              ? "border-primary bg-primary/10"
              : "border-border hover:border-primary/40"
          }`}
        >
          <input
            type="radio"
            name="alt"
            value={alt.id}
            checked={resposta === alt.id}
            onChange={(e) => setResposta(e.target.value)}
            className="h-4 w-4 accent-primary"
          />
          <span className="font-bold text-muted-foreground uppercase">
            {alt.id})
          </span>
          <span>{alt.texto}</span>
        </label>
      ))}
    </div>
  );
}

function CodigoJS({
  codigo,
  setCodigo,
  exemplos,
  exemplosTeste,
}: {
  codigo: string;
  setCodigo: (s: string) => void;
  exemplos?: { entrada: unknown; saida: unknown }[];
  exemplosTeste?: { entrada: unknown[]; saidaEsperada: unknown }[];
}) {
  return (
    <div className="space-y-4">
      {(exemplos?.length || exemplosTeste?.length) && (
        <div className="rounded-xl bg-muted/40 border border-border/50 p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4" /> Exemplos
          </div>
          <div className="font-mono text-xs space-y-1">
            {(exemplos ?? exemplosTeste)?.map((e, i) => (
              <div key={i} className="flex flex-wrap gap-2">
                <span className="text-muted-foreground">Entrada:</span>
                <code className="bg-background/70 px-1 rounded">
                  {JSON.stringify((e as never as Record<string, unknown>).entrada)}
                </code>
                <span className="text-muted-foreground">Saída:</span>
                <code className="bg-background/70 px-1 rounded">
                  {JSON.stringify(
                    (e as never as Record<string, unknown>).saida ??
                      (e as never as Record<string, unknown>).saidaEsperada
                  )}
                </code>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border/60 overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border/50 text-xs">
          <Code2 className="h-3.5 w-3.5" /> editor.js
        </div>
        <Textarea
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          rows={16}
          className="font-mono text-sm rounded-none border-0 focus-visible:ring-0"
          spellCheck={false}
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        />
      </div>
    </div>
  );
}

function ResultadoSubmissao({ r }: { r: SubmissionResp }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Resultado</h3>
            <span className="text-4xl font-extrabold gradient-text">{r.nota}</span>
          </div>

          {r.detalhes.erroSintaxe && (
            <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
              <p className="font-semibold text-destructive mb-1">
                Erro no seu código:
              </p>
              <pre className="text-xs font-mono whitespace-pre-wrap">
                {r.detalhes.erroSintaxe}
              </pre>
            </div>
          )}

          {r.detalhes.resultados && (
            <div className="mt-4 space-y-2">
              {r.detalhes.resultados.map((res, i) => (
                <div
                  key={i}
                  className={`rounded-xl border p-3 text-xs font-mono flex items-start gap-3 ${
                    res.passou
                      ? "border-emerald-500/40 bg-emerald-500/5"
                      : "border-destructive/40 bg-destructive/5"
                  }`}
                >
                  {res.passou ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive mt-0.5" />
                  )}
                  <div className="flex-1 space-y-1">
                    <div>
                      <span className="text-muted-foreground">Entrada: </span>
                      <code>{JSON.stringify(res.entrada)}</code>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Esperado: </span>
                      <code>{JSON.stringify(res.esperado)}</code>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Recebido: </span>
                      <code>{JSON.stringify(res.recebido)}</code>
                    </div>
                    {res.erro && (
                      <div className="text-destructive">{res.erro}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {r.detalhes.correta && (
            <p className="mt-4 text-sm">
              {r.detalhes.acertou ? (
                <span className="text-emerald-500 font-medium">
                  Você acertou! 🎉
                </span>
              ) : (
                <span className="text-destructive font-medium">
                  A resposta correta era: {r.detalhes.correta}
                </span>
              )}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
