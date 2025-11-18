import { createCustomerService } from "./customer.service.js"
import {type Request,type Response } from "express"


export const createCustomerController = async (req: Request, res: Response) => {
    const data = await createCustomerService(req.body)

    res.status(200).json({
        success: true,
        message: 'Account has been Created Successfully',
        data
    })
}