import type { ICompanyDocument } from "./company.interface.ts";
import { CompanyRepository } from "./company.repository.ts";


const companyRepository = new CompanyRepository();

export class CompanyService {
    async createCompany(data: Partial<ICompanyDocument>): Promise<ICompanyDocument> {
        // Add any business logic here before saving
        return await companyRepository.create(data);
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
