import { config } from "../config.js";

export type ResultadoAnaliseCV = {
  nota_tecnica: number;
  nota_compatibilidade: number;
  resumo: string;
  palavras_chave_encontradas: string[];
};

type RespostaIAServico = {
  nota_tecnica: number;
  nota_compatibilidade: number;
  resumo: string;
  palavras_chave_encontradas: string[];
};

export async function analisarTextoCV(
  texto: string,
  palavrasChaveVaga: string[],
): Promise<ResultadoAnaliseCV> {
  const url = `${config.aiServiceUrl.replace(/\/$/, "")}/analyze-cv`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      texto,
      palavras_chave_vaga: palavrasChaveVaga,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Serviço de IA indisponível: ${res.status} ${err}`);
  }

  return (await res.json()) as RespostaIAServico;
}
