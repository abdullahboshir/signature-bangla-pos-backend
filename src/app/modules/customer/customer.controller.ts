import { createCustomerService, getAllCustomersService } from "./customer.service.js" // Corrected import
import type { Request, Response } from "express"

export const getAllCustomersController = async (_req: Request, res: Response) => {
    const data = await getAllCustomersService();
    res.status(200).json({
        success: true,
        message: 'Customers retrieved successfully',
        data
    })
}

export const createCustomerController = async (req: Request, res: Response) => {
    const data = await createCustomerService(req.body)

    res.status(200).json({
        success: true,
        message: 'Account has been Created Successfully',
        data
    })
}