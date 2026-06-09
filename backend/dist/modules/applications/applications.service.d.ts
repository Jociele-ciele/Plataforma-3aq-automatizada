export declare const applicationsService: {
    apply(candidatoId: string, vagaId: string): Promise<{
        status: string;
        id: string;
        jobId: string;
        appliedAt: Date;
        candidateId: string;
    }>;
    listMine(candidatoId: string): Promise<{
        status: string;
        id: string;
        jobId: string;
        appliedAt: Date;
        candidateId: string;
    }[]>;
    listByJob(vagaId: string, recrutadorId: string): Promise<{
        status: string;
        id: string;
        jobId: string;
        appliedAt: Date;
        candidateId: string;
    }[]>;
    atualizarNotaFinal(applicationId: string): Promise<{
        status: string;
        id: string;
        jobId: string;
        appliedAt: Date;
        candidateId: string;
    }>;
    setStatus(applicationId: string, recrutadorId: string, status: "APROVADO" | "REPROVADO" | "EM_ANALISE", feedback?: string): Promise<{
        status: string;
        id: string;
        jobId: string;
        appliedAt: Date;
        candidateId: string;
    }>;
    getById(applicationId: string, userId: string, role: string): Promise<{
        status: string;
        id: string;
        jobId: string;
        appliedAt: Date;
        candidateId: string;
    }>;
};
//# sourceMappingURL=applications.service.d.ts.map