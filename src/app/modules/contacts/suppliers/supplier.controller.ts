import { Request, Response } from "express";

export const getAllSuppliersController = async (_req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'Suppliers retrieved successfully',
        data: []
    })
}
