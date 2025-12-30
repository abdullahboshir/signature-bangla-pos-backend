import { Company } from './company.model.ts';
import type { ICompanyDocument } from './company.interface.ts';

export class CompanyRepository {
    async create(data: Partial<ICompanyDocument>): Promise<ICompanyDocument> {
        return await Company.create(data);
    }

    async findAll(): Promise<ICompanyDocument[]> {
        return await Company.find();
    }

    async findById(id: string): Promise<ICompanyDocument | null> {
        return await Company.findById(id);
    }

    async update(id: string, data: Partial<ICompanyDocument>): Promise<ICompanyDocument | null> {
        return await Company.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id: string): Promise<ICompanyDocument | null> {
        return await Company.findByIdAndDelete(id);
    }
}
