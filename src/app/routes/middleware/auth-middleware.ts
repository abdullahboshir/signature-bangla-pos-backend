// Example for src\app\routes\middleware\auth-middleware.ts
import { type Request, type Response, type NextFunction } from "express";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Authentication logic here
  next();
};

export const adminAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Admin authentication logic here
  next();
};

export const vendorAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Vendor authentication logic here
  next();
};