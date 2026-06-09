import { CreateChallengeDTO, SubmitChallengeDTO } from "./challenges.schema";
export declare const challengesService: {
    create(recrutadorId: string, data: CreateChallengeDTO): Promise<{
        id: string;
        title: string;
        description: string;
        jobId: string;
        language: string;
        starterCode: string;
        testCases: import("@prisma/client/runtime/library").JsonValue;
        timeLimitMs: number;
    }>;
    listByJob(vagaId: string, paraCandidato: boolean): Promise<{
        id: string;
        title: string;
        description: string;
        jobId: string;
        language: string;
        starterCode: string;
        testCases: import("@prisma/client/runtime/library").JsonValue;
        timeLimitMs: number;
    }[]>;
    getById(id: string): Promise<{
        id: string;
        title: string;
        description: string;
        jobId: string;
        language: string;
        starterCode: string;
        testCases: import("@prisma/client/runtime/library").JsonValue;
        timeLimitMs: number;
    }>;
    submit(candidatoId: string, challengeId: string, data: SubmitChallengeDTO): Promise<{
        code: string;
        id: string;
        createdAt: Date;
        passedTests: number;
        totalTests: number;
        feedback: string;
        scorePercent: number;
        applicationId: string;
        challengeId: string;
    }>;
    remove(challengeId: string, recrutadorId: string): Promise<void>;
};
//# sourceMappingURL=challenges.service.d.ts.map