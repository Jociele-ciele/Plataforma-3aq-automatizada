import { Request, Response } from "express";
export declare const jobsController: {
    list(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    listMine(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    create(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    update(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    close(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    remove(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=jobs.controller.d.ts.map