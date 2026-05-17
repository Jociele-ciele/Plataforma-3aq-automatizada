export type AnaliseGithub = {
    login: string;
    repos_publicos: number;
    linguagens_principais: {
        nome: string;
        quantidade: number;
    }[];
    pontuacao_atividade: number;
    pontuacao_portfolio: number;
};
export declare function analisarGithubPublico(login: string): Promise<AnaliseGithub>;
//# sourceMappingURL=githubService.d.ts.map