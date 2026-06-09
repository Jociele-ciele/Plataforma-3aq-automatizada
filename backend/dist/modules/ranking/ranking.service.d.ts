export declare const rankingService: {
    byJob(vagaId: string): Promise<{
        posicao: number;
        applicationId: string;
        candidato: any;
        notaFinal: any;
        scoreCurriculo: any;
        scoreGithub: any;
        scoreDesafios: any;
        status: string;
        medalha: string | null;
    }[]>;
    dashboardRecrutador(recrutadorId: string): Promise<{
        totalVagas: number;
        vagasAbertas: number;
        vagasEncerradas: number;
        totalCandidatos: number;
        mediaNotas: number;
        tendencias: {
            vagas: number;
            abertas: number;
            candidatos: number;
            media: number;
        };
        top5: {
            status: string;
            id: string;
            jobId: string;
            appliedAt: Date;
            candidateId: string;
        }[];
        distribStatus: {
            status: string;
            total: number;
        }[];
        atividadesRecentes: {
            status: string;
            id: string;
            jobId: string;
            appliedAt: Date;
            candidateId: string;
        }[];
        porMes: {
            mes: string;
            total: number;
        }[];
    }>;
    dashboardCandidato(candidatoId: string): Promise<{
        vagasAbertas: any;
        totalInscricoes: any;
        aprovadas: any;
        reprovadas: any;
        emAnalise: any;
        mediaNotas: number;
        githubScore: any;
        desafiosResolvidos: {
            submissionId: any;
            challengeId: any;
            tipo: any;
            enunciado: any;
            peso: any;
            vaga: any;
            nota: number;
            createdAt: any;
        }[];
        mediaDesafios: number;
        historico: any;
    }>;
};
//# sourceMappingURL=ranking.service.d.ts.map