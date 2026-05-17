import type { Role } from "@prisma/client";
import type { File } from "multer";

declare global {
  namespace Express {
    interface Request {
      auth?: { userId: string; role: Role };
      file?: File;
    }
  }
}

export {};
