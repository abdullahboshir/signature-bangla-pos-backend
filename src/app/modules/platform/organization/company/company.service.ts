import type { ICompanyDocument } from "./company.interface.ts";
import { CompanyRepository } from "./company.repository.ts";

import { Package } from "@app/modules/platform/package/package.model.ts";
import { License } from "@app/modules/platform/license/license.model.ts";
import crypto from 'crypto';

const companyRepository = new CompanyRepository();

import { startSession } from "mongoose";
import { makeSlug } from "@core/utils/utils.common.ts";
import { Company } from "./company.model.ts";
import { CompanySettings } from "./settings/settings.model.ts";
import { UserBusinessAccess } from "@app/modules/iam/user-business-access/user-business-access.model.ts";



import { createCompanyOwnerService } from "@app/modules/iam/user/user.service.ts";
import BusinessUnit from "../business-unit/core/business-unit.model.ts";

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

            if (data.name && !data.slug) {
                data.slug = await this.generateUniqueSlug(data.name);
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

            // 5. Create Default Trial License (Atomic)
            const trialPackage = await Package.findOne({ slug: 'trial' }).session(session) || await Package.findOne({ isActive: true }).session(session);

            if (trialPackage) {
                const licenseKey = crypto.randomBytes(8).toString('hex').toUpperCase().match(/.{1,4}/g)?.join('-') || 'KEY-ERROR';
                await License.create([{
                    clientId: company.id, // Linking directly to Company ID (assuming strict BU check is not enforced at DB level or Company IS the Unit)
                    clientName: company.name,
                    packageId: trialPackage._id,
                    key: licenseKey,
                    status: 'active',
                    activationDate: new Date(),
                    expiresAt: new Date(Date.now() + (trialPackage.trialPeriodDays ?? 14) * 24 * 60 * 60 * 1000), // Dynamic Trial Period
                    customModules: trialPackage.moduleAccess
                }], { session });
            }

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

        let companies = [];

        // 1. If Super Admin, return all companies
        if (user.isSuperAdmin || (user.globalRoles || []).some((r: any) =>
            (typeof r === 'string' ? r : r.name).toLowerCase().includes('super-admin')
        )) {
            companies = await companyRepository.findAll();
        } else {
            // 2. For other users (like Company Owner), use companies list from auth middleware
            const authorizedCompanyIds = user?.companies || [];

            console.log('COMPANY_SERVICE_AUTH_COMPANIES:', {
                count: authorizedCompanyIds.length,
                ids: authorizedCompanyIds
            });

            if (authorizedCompanyIds.length > 0) {
                companies = await companyRepository.findAll({ _id: { $in: authorizedCompanyIds } });
            } else {
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
                companies = await companyRepository.findAll({ _id: { $in: companyIds } });
            }
        }

        // =========================================================
        // ENRICHMENT: Attach Subscription/License Details
        // =========================================================
        if (companies.length > 0) {
            const companyIds = companies.map(c => c._id);

            // 1. Find all Business Units for these companies
            const businessUnits = await BusinessUnit.find({ company: { $in: companyIds } }).select('_id company');
            const buIds = businessUnits.map(b => b._id);
            const buCompanyMap = businessUnits.reduce((acc, bu: any) => {
                acc[bu._id.toString()] = bu.company.toString();
                return acc;
            }, {} as Record<string, string>);

            // 2. Find Licenses for these Business Units
            const licenses = await License.find({
                clientId: { $in: buIds },
                status: { $in: ['active', 'expired', 'revoked'] }
            }).populate('packageId');

            // 3. Map Licenses to Companies
            const companyLicenseMap: Record<string, any> = {};
            licenses.forEach((license: any) => {
                const companyId = buCompanyMap[license.clientId.toString()];
                if (companyId) {
                    // Primitive logic: just take the first one found, or prefer 'active'
                    if (!companyLicenseMap[companyId] || (companyLicenseMap[companyId].status !== 'active' && license.status === 'active')) {
                        companyLicenseMap[companyId] = {
                            planName: license.packageId?.name || 'Custom Plan',
                            status: license.status,
                            expiresAt: license.expiresAt,
                            key: license.key
                        };
                    }
                }
            });

            // 4. Attach to Company Objects
            return companies.map(company => {
                const companyObj = company.toObject ? company.toObject() : company;
                const subscription = companyLicenseMap[companyObj._id.toString()] || {
                    planName: 'No Plan',
                    status: 'inactive',
                    expiresAt: null
                };
                return { ...companyObj, subscription };
            }) as any;
        }

        return companies;
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

    /**
     * Get Dashboard Stats for a Company (Aggregated across all Business Units)
     */
    async getCompanyDashboardStats(companyId: string) {
        try {
            const { Order } = await import("@app/modules/commerce/sales/order/order.model.ts");
            const { User } = await import("@app/modules/iam/user/user.model.ts");
            const { Purchase } = await import("@app/modules/erp/purchase/purchase.model.js");
            const { Expense } = await import("@app/modules/pos/cash/expense/expense.model.js");
            const mongoose = await import("mongoose");

            // 1. Get all Business Units for this Company
            const businessUnits = await BusinessUnit.find({ company: companyId }).select('_id');
            const buIds = businessUnits.map(bu => bu._id);

            if (buIds.length === 0) {
                return {
                    totalSales: 0, invoiceDue: 0, net: 0, totalSellReturn: 0,
                    totalPurchase: 0, purchaseDue: 0, totalPurchaseReturn: 0, expense: 0,
                    businessUnits: { active: 0 }, users: { total: 0 }
                };
            }

            const matchStage = { businessUnit: { $in: buIds.map(id => new mongoose.Types.ObjectId(id.toString())) } };

            // 2. Sales Stats
            const salesStats = await Order.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: null,
                        totalSales: { $sum: "$totalAmount" },
                        dueAmount: { $sum: "$dueAmount" },
                        totalReturns: {
                            $sum: { $cond: [{ $eq: ["$status", "returned"] }, "$totalAmount", 0] }
                        }
                    }
                }
            ]);

            // 3. Purchase Stats
            const purchaseStats = await Purchase.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: null,
                        totalPurchase: { $sum: "$grandTotal" }, // Use grandTotal from Purchase model
                        dueAmount: { $sum: "$dueAmount" },
                        totalReturns: {
                            $sum: { $cond: [{ $eq: ["$status", "returned"] }, "$grandTotal", 0] }
                        }
                    }
                }
            ]);

            // 4. Expense Stats
            const expenseStats = await Expense.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: null,
                        totalExpense: { $sum: "$amount" }
                    }
                }
            ]);

            // 5. Active Users
            const activeUsers = await User.countDocuments({
                businessUnits: { $in: buIds },
                status: 'active'
            });

            return {
                totalSales: salesStats[0]?.totalSales || 0,
                net: (salesStats[0]?.totalSales || 0) - (salesStats[0]?.totalReturns || 0),
                invoiceDue: salesStats[0]?.dueAmount || 0,
                totalSellReturn: salesStats[0]?.totalReturns || 0,

                totalPurchase: purchaseStats[0]?.totalPurchase || 0,
                purchaseDue: purchaseStats[0]?.dueAmount || 0,
                totalPurchaseReturn: purchaseStats[0]?.totalReturns || 0,

                expense: expenseStats[0]?.totalExpense || 0,
                businessUnits: { active: buIds.length },
                users: { total: activeUsers }
            };

        } catch (error: any) {
            console.error("Failed to get company dashboard stats", error.message);
            throw new Error("Failed to get company dashboard stats");
        }
    }

    private async generateUniqueSlug(name: string): Promise<string> {
        const baseSlug = makeSlug(name);
        let slug = baseSlug;
        let counter = 1;

        while (true) {
            const existing = await Company.findOne({ slug });
            if (!existing) break;
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        return slug;
    }
}
