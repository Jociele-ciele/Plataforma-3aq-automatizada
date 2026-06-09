export declare class AppError extends Error {
    status: number;
    code?: string;
    constructor(message: string, status?: number, code?: string);
}
export declare class UnauthorizedError extends AppError {
    constructor(message?: string);
}
export declare class ForbiddenError extends AppError {
    constructor(message?: string);
}
export declare class NotFoundError extends AppError {
    constructor(message?: string);
}
//# sourceMappingURL=errors.d.ts.map