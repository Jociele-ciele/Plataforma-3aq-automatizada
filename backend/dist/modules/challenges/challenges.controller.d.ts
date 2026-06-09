import { Request, Response } from "express";
export declare const challengesController: {
    create(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    listByJob(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    submit(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    remove(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=challenges.controller.d.ts.map