import { Request, Response } from "express";
export declare const applicationsController: {
    apply(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    listMine(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    listByJob(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    setStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    refreshScore(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=applications.controller.d.ts.map