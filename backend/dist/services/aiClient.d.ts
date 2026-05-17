export type ResultadoAnaliseCV = {
    nota_tecnica: number;
    nota_compatibilidade: number;
    resumo: string;
    palavras_chave_encontradas: string[];
};
export declare function analisarTextoCV(texto: string, palavrasChaveVaga: string[]): Promise<ResultadoAnaliseCV>;
//# sourceMappingURL=aiClient.d.ts.map