import { type Request, type Response, type NextFunction } from "express";

export const authMiddleware = (_req: Request, _res: Response, next: NextFunction) => {
  // Authentication logic here
  next();
};

export const adminAuthMiddleware = (_req: Request, _res: Response, next: NextFunction) => {
  // Admin authentication logic here
  next();
};

export const vendorAuthMiddleware = (_req: Request, _res: Response, next: NextFunction) => {
  // Vendor authentication logic here
  next();
};