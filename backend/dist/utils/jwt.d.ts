import { Role } from "@prisma/client";
export interface TokenPayload {
    sub: string;
    role: Role;
    email: string;
}
export declare function signAccessToken(payload: TokenPayload): string;
export declare function signRefreshToken(payload: TokenPayload): string;
export declare function verifyAccessToken(token: string): TokenPayload;
export declare function verifyRefreshToken(token: string): TokenPayload;
//# sourceMappingURL=jwt.d.ts.map