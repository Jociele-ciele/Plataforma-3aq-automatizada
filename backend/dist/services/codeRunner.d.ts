export type CasoTeste = {
    input: unknown;
    expected: unknown;
};
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
export declare function executarDesafioJavascript(codigo: string, casosTeste: CasoTeste[], limiteTempoMs: number): ResultadoExecucao;
//# sourceMappingURL=codeRunner.d.ts.map