export declare const usersService: {
    getProfile(userId: string): Promise<{
        email: string;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        passwordHash: string;
        name: string;
        githubLogin: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateProfile(userId: string, data: {
        nome?: string;
        bio?: string;
        github?: string;
    }): Promise<{
        email: string;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        passwordHash: string;
        name: string;
        githubLogin: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    exportData(userId: string): Promise<{
        email: string;
        role: import(".prisma/client").$Enums.Role;
        id: string;
        passwordHash: string;
        name: string;
        githubLogin: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    deleteAccount(userId: string): Promise<void>;
};
//# sourceMappingURL=users.service.d.ts.map