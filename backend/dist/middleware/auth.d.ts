import type { NextFunction, Request, Response } from "express";
import type { Role } from "@prisma/client";
export type AuthPayload = {
    sub: string;
    role: Role;
};
declare module "express-serve-static-core" {
    interface Request {
        auth?: {
            userId: string;
            role: Role;
        };
    }
}
export declare function signToken(payload: AuthPayload): string;
export declare function authMiddleware(requiredRoles?: Role[]): (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map