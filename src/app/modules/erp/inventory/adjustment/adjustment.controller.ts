import type { Request, Response, NextFunction } from 'express';
import { createAdjustmentService, getAdjustmentsService } from './adjustment.service.js';
import { getLedgerHistoryService } from '../ledger/ledger.service.js';

export const createAdjustmentController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user._id; // Assuming auth middleware populates user
        const result = await createAdjustmentService(req.body, userId);
        res.status(201).json({
            success: true,
            message: "Stock adjustment created successfully",
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const getAdjustmentsController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await getAdjustmentsService(req.query);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

// Ledger Controller methods here for convenience
export const getLedgerController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await getLedgerHistoryService(req.query);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};
