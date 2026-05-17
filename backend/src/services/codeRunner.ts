import vm from "vm";

export type CasoTeste = { input: unknown; expected: unknown };

export type ResultadoExecucao = {
  testes_aprovados: number;
  total_testes: number;
  detalhes: string[];
  percentual_nota: number;
};

/**
 * Executa código JavaScript do candidato num contexto isolado com timeout.
 * O candidato deve definir: function solution(input) { ... }
 */
export function executarDesafioJavascript(
  codigo: string,
  casosTeste: CasoTeste[],
  limiteTempoMs: number,
): ResultadoExecucao {
  const detalhes: string[] = [];
  let testes_aprovados = 0;
  const total_testes = casosTeste.length;

  for (let i = 0; i < casosTeste.length; i++) {
    const tc = casosTeste[i];
    const inputJson = JSON.stringify(tc.input);
    const wrapped = `
      ${codigo}
      (function() {
        if (typeof solution !== 'function') throw new Error('solution não é uma função');
        return solution(${inputJson});
      })();
    `;
    try {
      const result = vm.runInNewContext(wrapped, Object.create(null), {
        timeout: limiteTempoMs,
      });
      const ok = igualProfundo(result, tc.expected);
      if (ok) {
        testes_aprovados += 1;
        detalhes.push(`Caso ${i + 1}: passou`);
      } else {
        detalhes.push(
          `Caso ${i + 1}: falhou — obtido ${JSON.stringify(result)}, esperado ${JSON.stringify(tc.expected)}`,
        );
      }
    } catch (e) {
      detalhes.push(
        `Caso ${i + 1}: erro — ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  const percentual_nota =
    total_testes === 0
      ? 0
      : Math.round((testes_aprovados / total_testes) * 10000) / 100;

  return { testes_aprovados, total_testes, detalhes, percentual_nota };
}

function igualProfundo(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return a === b;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((v, i) => igualProfundo(v, b[i]));
  }
  if (typeof a === "object" && typeof b === "object") {
    const ak = Object.keys(a as object).sort();
    const bk = Object.keys(b as object).sort();
    if (ak.length !== bk.length) return false;
    return ak.every((k) =>
      igualProfundo(
        (a as Record<string, unknown>)[k],
        (b as Record<string, unknown>)[k],
      ),
    );
  }
  return false;
}
