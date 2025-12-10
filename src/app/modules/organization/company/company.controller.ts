import { Request, Response } from 'express';
import { CompanyService } from './company.service';

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

export const getAllCompanies = async (req: Request, res: Response) => {
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
        const company = await companyService.getCompanyById(req.params.id);
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found',
            });
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
