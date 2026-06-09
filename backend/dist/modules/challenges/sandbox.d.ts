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
    nota: number;
    erroSintaxe?: string;
}
export declare function rodarCodigo(codigo: string, casos: CasoTeste[]): ResultadoSandbox;
//# sourceMappingURL=sandbox.d.ts.map