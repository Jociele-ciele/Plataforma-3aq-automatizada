import { LoginDTO, RegisterDTO } from "./auth.schema";
export declare const authService: {
    register(data: RegisterDTO): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            email: string;
            role: import(".prisma/client").$Enums.Role;
            id: string;
            passwordHash: string;
            name: string;
            githubLogin: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    login(data: LoginDTO): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            nome: any;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            github: any;
            avatar: any;
        };
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(refreshToken: string): Promise<void>;
    gerarTokens(userId: string, email: string, role: "CANDIDATO" | "RECRUTADOR"): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
};
//# sourceMappingURL=auth.service.d.ts.map