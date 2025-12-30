import type { Request, Response, NextFunction } from 'express';
import { getAllStockLevelsService, getProductStockLevelService } from './product-inventory.service.js';

export const getAllStockLevelsController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await getAllStockLevelsService(req.query);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const getProductStockLevelController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const result = await getProductStockLevelService(id as string);
        res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};
