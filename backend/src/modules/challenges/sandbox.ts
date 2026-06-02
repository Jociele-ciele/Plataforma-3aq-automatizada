import vm from "node:vm";

export interface CasoTeste {
  entrada: unknown[];
  saidaEsperada: unknown;
}

export interface ResultadoCaso {
  passou: boolean;
  entrada: unknown[];
  esperado: unknown;
  recebido: unknown;
  erro?: string;
  tempoMs: number;
}

export interface ResultadoSandbox {
  resultados: ResultadoCaso[];
  totalCasos: number;
  passados: number;
  nota: number; // 0..100
  erroSintaxe?: string;
}

const TIMEOUT_MS = 3000;

// Roda código JavaScript do candidato em ambiente isolado.
// Espera que o código exporte uma função chamada `solve` ou seja a última expressão.
export function rodarCodigo(codigo: string, casos: CasoTeste[]): ResultadoSandbox {
  const resultados: ResultadoCaso[] = [];

  let solve: ((...args: unknown[]) => unknown) | null = null;
  try {
    const wrapper = `(() => { ${codigo}\n; return typeof solve !== 'undefined' ? solve : null; })()`;
    const script = new vm.Script(wrapper);
    const context = vm.createContext(Object.create(null));
    solve = script.runInContext(context, { timeout: TIMEOUT_MS }) as never;
    if (typeof solve !== "function") {
      return {
        resultados: [],
        totalCasos: casos.length,
        passados: 0,
        nota: 0,
        erroSintaxe:
          "Sua submissão precisa declarar uma função `function solve(...)` que retorne o resultado.",
      };
    }
  } catch (e) {
    return {
      resultados: [],
      totalCasos: casos.length,
      passados: 0,
      nota: 0,
      erroSintaxe: (e as Error).message,
    };
  }

  let passados = 0;
  for (const caso of casos) {
    const inicio = performance.now();
    try {
      const recebido = vm.runInNewContext(
        "solve.apply(null, args)",
        { solve, args: caso.entrada },
        { timeout: TIMEOUT_MS }
      );
      const passou = JSON.stringify(recebido) === JSON.stringify(caso.saidaEsperada);
      if (passou) passados++;
      resultados.push({
        passou,
        entrada: caso.entrada,
        esperado: caso.saidaEsperada,
        recebido,
        tempoMs: Math.round(performance.now() - inicio),
      });
    } catch (e) {
      resultados.push({
        passou: false,
        entrada: caso.entrada,
        esperado: caso.saidaEsperada,
        recebido: null,
        erro: (e as Error).message,
        tempoMs: Math.round(performance.now() - inicio),
      });
    }
  }

  const total = casos.length || 1;
  return {
    resultados,
    totalCasos: casos.length,
    passados,
    nota: Math.round((passados / total) * 100),
  };
}