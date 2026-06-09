import { Request, Response } from "express";
export declare const authController: {
    register(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    login(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    refresh(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    logout(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    me(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=auth.controlles.d.ts.map