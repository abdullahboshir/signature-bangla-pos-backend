import { Company } from './company.model.ts';
import type { ICompanyDocument } from './company.interface.ts';
import { type ClientSession } from 'mongoose';

export class CompanyRepository {
    async create(data: Partial<ICompanyDocument>, session: ClientSession | null = null): Promise<ICompanyDocument> {
        if (session) {
            const [company] = await Company.create([data], { session });
            return company;
        }
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
