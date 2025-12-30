import type { Request, Response } from 'express';
import { CompanyService } from './company.service.ts';


const companyService = new CompanyService();

export const createCompany = async (req: Request, res: Response) => {
    try {
        const company = await companyService.createCompany(req.body);
        res.status(201).json({
            success: true,
            message: 'Company created successfully',
            data: company,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Failed to create company',
            error: error.message,
        });
    }
};

export const getAllCompanies = async (_req: Request, res: Response) => {
    try {
        const companies = await companyService.getAllCompanies();
        res.status(200).json({
            success: true,
            message: 'Companies retrieved successfully',
            data: companies,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve companies',
            error: error.message,
        });
    }
};

export const getCompanyById = async (req: Request, res: Response) => {
    try {
        const id = req.params['id'];
        if (!id) {
            res.status(400).json({
                success: false,
                message: 'Company ID is required',
            });
            return;
        }
        const company = await companyService.getCompanyById(id);
        if (!company) {
            res.status(404).json({
                success: false,
                message: 'Company not found',
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Company retrieved successfully',
            data: company,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve company',
            error: error.message,
        });
    }
};
