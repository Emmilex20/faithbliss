// src/middleware/sessionAuthMiddleware.ts
import { Request, Response, NextFunction } from 'express';

export const sessionProtect = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
        next();
    } else {
        return res.status(401).json({ message: 'Not authorized, active session required.' });
    }
};