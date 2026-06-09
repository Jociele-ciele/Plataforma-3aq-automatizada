import { Request, Response, NextFunction } from "express";
import { TokenPayload } from "../utils/jwt";
import { Role } from "@prisma/client";
declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload;
        }
    }
}
export declare function authenticate(req: Request, _res: Response, next: NextFunction): void;
export declare function authorize(...roles: Role[]): (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map