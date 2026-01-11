import { Company } from './company.model.ts';
import type { ICompanyDocument } from './company.interface.ts';
import { type ClientSession } from 'mongoose';

export class CompanyRepository {
    async create(data: Partial<ICompanyDocument>, session: ClientSession | null = null): Promise<ICompanyDocument> {
        if (session) {
            const [company] = await Company.create([data], { session });
            if (!company) throw new Error("Failed to create company");
            return company as ICompanyDocument;
        }
        return await Company.create(data);
    }

    async findAll(filter: Record<string, any> = {}): Promise<ICompanyDocument[]> {
        return await Company.find(filter);
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
