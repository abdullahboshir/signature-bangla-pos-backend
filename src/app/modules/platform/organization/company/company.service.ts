import type { ICompanyDocument } from "./company.interface.ts";
import { CompanyRepository } from "./company.repository.ts";


const companyRepository = new CompanyRepository();

import { startSession } from "mongoose";

import { CompanySettings } from "./settings/settings.model.ts";
import { UserBusinessAccess } from "@app/modules/iam/user-business-access/user-business-access.model.ts";
import mongoose from "mongoose";


import { createCompanyOwnerService } from "@app/modules/iam/user/user.service.ts";

export class CompanyService {
    async createCompany(data: Partial<ICompanyDocument>): Promise<ICompanyDocument> {
        const session = await startSession();
        session.startTransaction();
        try {
            // 1. Prepare Data & Create Company
            // Mongoose model requires root 'name' separate from 'branding.name'
            if (data.branding?.name && !data.name) {
                data.name = data.branding.name;
            }

            const company = await companyRepository.create(data, session);

            const name = data.branding?.name;
            const email = data.contact?.email;
            const phone = data.contact?.phone;

            if (!email || !name || !phone) {
                throw new Error("Missing required company contact details for owner creation");
            }

            // 3. Create Default Company Settings (Atomic)
            await CompanySettings.getSettings(company.id, session);

            // 4. Create Company Owner & Send Email (Atomic)
            // This handles User creation, Merchant profile, Access assignment, and Email sending
            await createCompanyOwnerService({
                contactEmail: email,
                name: name,
                contactPhone: phone,
                ...(data.legalRepresentative && { legalRepresentative: data.legalRepresentative })
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

    async getAllCompanies(user: any): Promise<ICompanyDocument[]> {
        if (!user) return [];

        // 1. If Super Admin, return all companies
        if (user.isSuperAdmin || (user.globalRoles || []).some((r: any) =>
            (typeof r === 'string' ? r : r.name).toLowerCase().includes('super-admin')
        )) {
            return await companyRepository.findAll();
        }

        // 2. For other users (like Company Owner), use companies list from auth middleware
        // This is prepopulated by the auth middleware via businessAccess records (even with custom IDs)
        const authorizedCompanyIds = user?.companies || [];

        console.log('COMPANY_SERVICE_AUTH_COMPANIES:', {
            count: authorizedCompanyIds.length,
            ids: authorizedCompanyIds
        });

        if (authorizedCompanyIds.length > 0) {
            return await companyRepository.findAll({ _id: { $in: authorizedCompanyIds } });
        }

        // Fallback: If middleware didn't find anything, try manual lookup (Legacy support/Defensive)
        let userId = user?._id || user?.id || user?.userId;
        let userIdStr = userId?.toString() || "";

        if (userIdStr && userIdStr.includes('-') && userIdStr.length > 24) {
            userIdStr = userIdStr.split('-')[0];
        }

        const businessAccess = await UserBusinessAccess.find({
            user: userIdStr,
            status: 'ACTIVE'
        }).select('company');

        const companyIds = [...new Set(businessAccess.map(access => access.company?.toString()).filter(Boolean))];

        return await companyRepository.findAll({ _id: { $in: companyIds } });
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
