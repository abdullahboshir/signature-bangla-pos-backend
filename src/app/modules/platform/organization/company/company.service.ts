import type { ICompanyDocument } from "./company.interface.ts";
import { CompanyRepository } from "./company.repository.ts";


const companyRepository = new CompanyRepository();

import { startSession } from "mongoose";
import { createCompanyOwnerService } from "../../../iam/user/user.service.ts"; // Check path relative to modules/platform/organization/company

export class CompanyService {
    async createCompany(data: Partial<ICompanyDocument>): Promise<ICompanyDocument> {
        const session = await startSession();
        session.startTransaction();
        try {
            // 1. Create Company
            const company = await companyRepository.create(data, session);

            if (!data.contactEmail || !data.name || !data.contactPhone) {
                // Should be validated by Zod by now, but safe check
                throw new Error("Missing required company contact details for owner creation");
            }

            // 2. Create Company Owner User
            await createCompanyOwnerService({
                contactEmail: data.contactEmail,
                name: data.name,
                contactPhone: data.contactPhone
            }, company.id, session);

            await session.commitTransaction();
            return company;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async getAllCompanies(): Promise<ICompanyDocument[]> {
        return await companyRepository.findAll();
    }

    async getCompanyById(id: string): Promise<ICompanyDocument | null> {
        return await companyRepository.findById(id);
    }

    async updateCompany(id: string, data: Partial<ICompanyDocument>): Promise<ICompanyDocument | null> {
        return await companyRepository.update(id, data);
    }

    async deleteCompany(id: string): Promise<ICompanyDocument | null> {
        return await companyRepository.delete(id);
    }
}
