import type { IOrganizationDocument } from "./organization.interface.js";
import { OrganizationRepository } from "./organization.repository.js";

import { Package } from "@app/modules/platform/package/package.model.ts";
import { License } from "@app/modules/platform/license/license.model.ts";
import crypto from 'crypto';

const organizationRepository = new OrganizationRepository();

import { startSession } from "mongoose";
import { makeSlug } from "@core/utils/utils.common.ts";
import { Organization } from "./organization.model.js";
import { OrganizationSettings } from "./settings/settings.model.js";
import { UserBusinessAccess } from "@app/modules/iam/user-business-access/user-business-access.model.ts";



import { createOrganizationOwnerService } from "@app/modules/iam/user/user.service.ts";
import BusinessUnit from "./business-unit/core/business-unit.model.ts";


export class OrganizationService {
    async createOrganization(data: Partial<IOrganizationDocument>): Promise<IOrganizationDocument> {
        const session = await startSession();
        session.startTransaction();
        try {
            // 1. Prepare Data & Create Organization
            // Mongoose model requires root 'name' separate from 'branding.name'
            if (data.branding?.name && !data.name) {
                data.name = data.branding.name;
            }

            if (data.name && !data.slug) {
                data.slug = await this.generateUniqueSlug(data.name);
            }

            const organization = await organizationRepository.create(data, session);

            const name = data.branding?.name;
            const email = data.contact?.email;
            const phone = data.contact?.phone;

            if (!email || !name || !phone) {
                throw new Error("Missing required organization contact details for owner creation");
            }

            // 3. Create Default Organization Settings (Atomic)
            await OrganizationSettings.getSettings(organization.id, session);

            // 4. Create Organization Owner & Send Email (Atomic)
            // This handles User creation, Merchant profile, Access assignment, and Email sending
            await createOrganizationOwnerService({
                contactEmail: email,
                name: name,
                contactPhone: phone,
                ...(data.legalRepresentative && { legalRepresentative: data.legalRepresentative })
            }, organization.id, session);

            // 5. Create Default Trial License (Atomic)
            const trialPackage = await Package.findOne({ slug: 'trial' }).session(session) || await Package.findOne({ isActive: true }).session(session);

            if (trialPackage) {
                const licenseKey = crypto.randomBytes(8).toString('hex').toUpperCase().match(/.{1,4}/g)?.join('-') || 'KEY-ERROR';
                await License.create([{
                    clientId: organization.id, // Linking directly to Organization ID (assuming strict BU check is not enforced at DB level or Organization IS the Unit)
                    clientName: organization.name,
                    packageId: trialPackage._id,
                    key: licenseKey,
                    status: 'active',
                    activationDate: new Date(),
                    expiresAt: new Date(Date.now() + (trialPackage.trialPeriodDays ?? 14) * 24 * 60 * 60 * 1000), // Dynamic Trial Period
                    customModules: trialPackage.moduleAccess
                }], { session });
            }

            await session.commitTransaction();
            return organization;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async getAllOrganizations(user: any): Promise<IOrganizationDocument[]> {
        if (!user) return [];

        let organizations = [];

        // 1. If Super Admin, return all organizations
        if (user.isSuperAdmin || (user.globalRoles || []).some((r: any) =>
            (typeof r === 'string' ? r : r.name).toLowerCase().includes('super-admin')
        )) {
            organizations = await organizationRepository.findAll();
        } else {
            // 2. For other users (like Organization Owner), use organizations list from auth middleware
            const authorizedOrganizationIds = user?.companies || [];

            console.log('ORGANIZATION_SERVICE_AUTH_ORGANIZATIONS:', {
                count: authorizedOrganizationIds.length,
                ids: authorizedOrganizationIds
            });

            if (authorizedOrganizationIds.length > 0) {
                organizations = await organizationRepository.findAll({ _id: { $in: authorizedOrganizationIds } });
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
                }).select('organization');

                const organizationIds = [...new Set(businessAccess.map(access => access.organization?.toString()).filter(Boolean))];
                organizations = await organizationRepository.findAll({ _id: { $in: organizationIds } });
            }
        }

        // =========================================================
        // ENRICHMENT: Attach Subscription/License Details
        // =========================================================
        if (organizations.length > 0) {
            const organizationIds = organizations.map(c => c._id);

            // 1. Find all Business Units for these organizations
            const businessUnits = await BusinessUnit.find({ organization: { $in: organizationIds } }).select('_id organization');
            const buIds = businessUnits.map(b => b._id);
            const buOrganizationMap = businessUnits.reduce((acc, bu: any) => {
                acc[bu._id.toString()] = bu.organization.toString();
                return acc;
            }, {} as Record<string, string>);

            // 2. Find Licenses for these Business Units
            const licenses = await License.find({
                clientId: { $in: buIds },
                status: { $in: ['active', 'expired', 'revoked'] }
            }).populate('packageId');

            // 3. Map Licenses to Organizations
            const organizationLicenseMap: Record<string, any> = {};
            licenses.forEach((license: any) => {
                const organizationId = buOrganizationMap[license.clientId.toString()];
                if (organizationId) {
                    // Primitive logic: just take the first one found, or prefer 'active'
                    if (!organizationLicenseMap[organizationId] || (organizationLicenseMap[organizationId].status !== 'active' && license.status === 'active')) {
                        organizationLicenseMap[organizationId] = {
                            planName: license.packageId?.name || 'Custom Plan',
                            status: license.status,
                            expiresAt: license.expiresAt,
                            key: license.key
                        };
                    }
                }
            });

            // 4. Attach to Organization Objects
            return organizations.map(organization => {
                const organizationObj = organization.toObject ? organization.toObject() : organization;
                const subscription = organizationLicenseMap[organizationObj._id.toString()] || {
                    planName: 'No Plan',
                    status: 'inactive',
                    expiresAt: null
                };
                return { ...organizationObj, subscription };
            }) as any;
        }

        return organizations;
    }

    async getOrganizationById(id: string): Promise<IOrganizationDocument | null> {
        return await organizationRepository.findById(id);
    }

    async updateOrganization(id: string, data: Partial<IOrganizationDocument>): Promise<IOrganizationDocument | null> {
        return await organizationRepository.update(id, data);
    }

    async deleteOrganization(id: string): Promise<IOrganizationDocument | null> {
        return await organizationRepository.delete(id);
    }

    /**
     * Get Dashboard Stats for a Organization (Aggregated across all Business Units)
     */
    async getOrganizationDashboardStats(organizationId: string) {
        try {
            const { Order } = await import("@app/modules/commerce/sales/order/order.model.ts");
            const { User } = await import("@app/modules/iam/user/user.model.ts");
            const { Purchase } = await import("@app/modules/erp/purchase/purchase.model.js");
            const { Expense } = await import("@app/modules/pos/cash/expense/expense.model.js");
            const mongoose = await import("mongoose");

            // 1. Get all Business Units for this Organization
            const businessUnits = await BusinessUnit.find({ organization: organizationId }).select('_id');
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
            console.error("Failed to get organization dashboard stats", error.message);
            throw new Error("Failed to get organization dashboard stats");
        }
    }

    async updateTenantConfig(id: string, config: any): Promise<IOrganizationDocument | null> {
        const organization = await organizationRepository.update(id, { tenantConfig: config });
        
        if (organization) {
            // Invalidate caches
            const { TenantService } = await import("@core/services/tenant.service.ts");
            const { TenantStorageService } = await import("@shared/file-storage/tenant-storage.service.ts");
            
            // Invalidate Redis/Memory cache for tenant resolution
            if (organization.tenantConfig?.customDomain) {
                 await TenantService.invalidateTenantCache(organization.tenantConfig.customDomain);
            }
            // Invalidate storage provider cache
            TenantStorageService.invalidateProviderCache(organization.id);
        }
        
        return organization;
    }

    private async generateUniqueSlug(name: string): Promise<string> {
        const baseSlug = makeSlug(name);
        let slug = baseSlug;
        let counter = 1;

        while (true) {
            const existing = await Organization.findOne({ slug });
            if (!existing) break;
            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        return slug;
    }
}
