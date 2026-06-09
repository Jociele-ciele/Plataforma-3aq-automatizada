import { CreateJobDTO, UpdateJobDTO } from "./jobs.schema";
export declare const jobsService: {
    list(filtro?: {
        status?: string;
        q?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        description: string;
        stack: string[];
        criteria: import("@prisma/client/runtime/library").JsonValue | null;
        isOpen: boolean;
        recruiterId: string;
    }[]>;
    getById(id: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        description: string;
        stack: string[];
        criteria: import("@prisma/client/runtime/library").JsonValue | null;
        isOpen: boolean;
        recruiterId: string;
    }>;
    create(recrutadorId: string, data: CreateJobDTO): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        description: string;
        stack: string[];
        criteria: import("@prisma/client/runtime/library").JsonValue | null;
        isOpen: boolean;
        recruiterId: string;
    }>;
    update(jobId: string, recrutadorId: string, data: UpdateJobDTO): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        description: string;
        stack: string[];
        criteria: import("@prisma/client/runtime/library").JsonValue | null;
        isOpen: boolean;
        recruiterId: string;
    }>;
    close(jobId: string, recrutadorId: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        description: string;
        stack: string[];
        criteria: import("@prisma/client/runtime/library").JsonValue | null;
        isOpen: boolean;
        recruiterId: string;
    }>;
    remove(jobId: string, recrutadorId: string): Promise<void>;
    myJobs(recrutadorId: string): Promise<{
        id: string;
        createdAt: Date;
        title: string;
        description: string;
        stack: string[];
        criteria: import("@prisma/client/runtime/library").JsonValue | null;
        isOpen: boolean;
        recruiterId: string;
    }[]>;
};
//# sourceMappingURL=jobs.service.d.ts.map