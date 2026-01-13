import { License } from './license.model.ts';
import type { ILicense } from './license.interface.ts';
import AppError from '../../../../shared/errors/app-error.js';
import httpStatus from 'http-status';
import crypto from 'crypto';
import { QueueService } from "../queue/queue.service.ts";
import { QUEUE_NAMES } from "../queue/queue.interface.ts";

const generateLicenseKey = (): string => {
    // Format: XXXX-XXXX-XXXX-XXXX
    return crypto.randomBytes(8).toString('hex').toUpperCase().match(/.{1,4}/g)?.join('-') || 'KEY-ERROR';
};

// --- Billing Utilities ---
const calculateNextBillingDate = (baseDate: Date, billingCycle: 'monthly' | 'yearly' | 'lifetime'): Date | undefined => {
    if (billingCycle === 'lifetime') return undefined;
    const date = new Date(baseDate);
    if (billingCycle === 'monthly') date.setMonth(date.getMonth() + 1);
    if (billingCycle === 'yearly') date.setFullYear(date.getFullYear() + 1);
    return date;
};

const calculateProratedPrice = (fullPrice: number, billingCycle: 'monthly' | 'yearly' | 'lifetime', nextBillingDate?: Date): number => {
    if (billingCycle === 'lifetime' || !nextBillingDate) return fullPrice;

    const now = new Date();
    const totalDaysInCycle = billingCycle === 'monthly' ? 30 : 365; // Simplified for calculation
    const remainingMs = nextBillingDate.getTime() - now.getTime();
    const remainingDays = Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)));

    if (remainingDays <= 0) return 0;
    if (remainingDays >= totalDaysInCycle) return fullPrice;

    const dailyRate = fullPrice / totalDaysInCycle;
    return Math.ceil(dailyRate * remainingDays);
};

import { Types } from 'mongoose';
import BusinessUnit from '../organization/business-unit/core/business-unit.model.ts';
import { Company } from '../organization/company/company.model.ts';


// --- Helper: Sync License Modules to Company/BusinessUnit (Zenith Sync) ---
const syncModulesToTarget = async (license: ILicense) => {
    try {
        const bu = await BusinessUnit.findById(license.clientId);
        if (!bu) {
            console.error("⚠️ Sync Aborted: BusinessUnit not found for license:", license.clientId);
            return;
        }

        // Extract raw enabled booleans
        const activeModules: Record<string, boolean> = {};
        if (license.customModules) {
            Object.entries(license.customModules).forEach(([key, config]: [string, any]) => {
                activeModules[key] = !!config.enabled;
            });
        }

        // 1. Update Business Unit
        await BusinessUnit.findByIdAndUpdate(license.clientId, { $set: { activeModules } });

        // 2. Update Parent Company (The source of truth for auth middleware)
        if (bu.company) {
            await Company.findByIdAndUpdate(bu.company, { $set: { activeModules } });
            console.log(`✅ Modules synced to Company: ${bu.company}`);
        }

    } catch (error) {
        console.error("❌ Failed to sync modules to target:", error);
    }
};


// --- Helper: Resolve Business Unit ID from mixed inputs ---
const resolveBusinessUnitId = async (rawId: any): Promise<{ id: Types.ObjectId, name: string }> => {
    console.log("� Resolving Business Unit ID for input:", JSON.stringify(rawId));

    // Catch null, undefined, or empty strings explicitly
    if (rawId === null || rawId === undefined || rawId === '') {
        console.error("❌ Resolution Failed: Input is null, undefined, or empty string.");
        throw new AppError(httpStatus.BAD_REQUEST, "Target Client ID (Business Unit or Company ID) is required.");
    }

    // Advanced Resolution: Handle objects (Record, Select values, Populated docs)
    let target: any = rawId;
    if (typeof rawId === 'object') {
        target = rawId._id || rawId.id || rawId.value || rawId.clientId || rawId.companyId || rawId;
    }

    // Re-verify after extraction
    if (!target || target === '' || typeof target === 'object') {
        console.error("❌ Failed to resolve primitive ID from complex input:", rawId);
        throw new AppError(httpStatus.BAD_REQUEST, "A valid Business Unit or Company ID must be provided. Could not extract ID from input.");
    }

    const targetStr = target.toString().trim();
    console.log("📍 Extracted ID String:", targetStr);

    const isObjectId = Types.ObjectId.isValid(targetStr);

    if (isObjectId) {
        const buId = new Types.ObjectId(targetStr);
        let bu = await BusinessUnit.findById(buId);
        if (!bu) {
            console.log("🏢 ID is not a BusinessUnit, checking as Company ID...");
            // Check if it's a Company ID, get primary BU
            bu = await BusinessUnit.findOne({ company: buId }).sort({ createdAt: 1 });
        }
        if (bu) {
            console.log("✅ Resolved to BusinessUnit:", bu.name, `(${bu._id})`);
            return { id: bu._id as Types.ObjectId, name: bu.name };
        }
    } else {
        // Handle Slugs
        console.log("🐚 ID is not an ObjectId, checking as Slug:", targetStr);
        const bu = await BusinessUnit.findOne({ slug: targetStr });
        if (bu) {
            console.log("✅ Resolved Slug to BusinessUnit:", bu.name, `(${bu._id})`);
            return { id: bu._id as Types.ObjectId, name: bu.name };
        }
    }

    console.error("❌ Resolution Failed: Target not found for identity:", targetStr);
    throw new AppError(httpStatus.NOT_FOUND, `Target Business Unit or Company not found for identity: ${targetStr}`);
};

/**
 * 💰 Unified Pricing Logic (Absolute Zenith Standard)
 * Merges Package Defaults with Custom User Selections for Accurate Pricing
 */
const calculateLicensePricing = async (packageId: string, customModules?: any, overriddenLimits?: any) => {
    const { Package } = await import('../package/package.model.ts');
    const pkg = await Package.findById(packageId);

    if (!pkg) {
        throw new AppError(httpStatus.NOT_FOUND, "Package not found for pricing calculation.");
    }

    const baseModules = pkg.moduleAccess || {};
    const modulePrices: Array<{ module: string; price: number }> = [];
    let totalPrice = pkg.price; // Start with Package Base Price

    // We process ALL modules mentioned in either the package or the user's overrides
    const userModules = customModules || {};
    const allModuleKeys = new Set([...Object.keys(baseModules), ...Object.keys(userModules)]);

    allModuleKeys.forEach((key) => {
        const pkgConfig = (baseModules as any)[key];
        const userConfig = userModules[key];

        // Preference: userConfig.enabled if provided, otherwise pkgConfig.enabled
        const isEnabled = userConfig?.enabled !== undefined ? userConfig.enabled : pkgConfig?.enabled;

        if (isEnabled) {
            const modulePrice = pkgConfig?.monthlyPrice || 0;
            if (modulePrice > 0) {
                totalPrice += modulePrice;
                modulePrices.push({ module: key, price: modulePrice });
            }
        }
    });

    return {
        billingCycle: pkg.billingCycle,
        totalPrice,
        priceBreakdown: {
            basePrice: pkg.price,
            modulePrices: modulePrices
        },
        overriddenLimits: overriddenLimits ? { ...pkg.limits, ...overriddenLimits } : pkg.limits
    };
};

const createLicense = async (payload: Partial<ILicense>) => {
    try {
        // 🛠️ Robust ID Resolution (Ensures BusinessUnit ObjectId)
        const rawId = payload.clientId || (payload as any).companyId || (payload as any).company;
        const resolved = await resolveBusinessUnitId(rawId);

        payload.clientId = resolved.id;
        payload.clientName = resolved.name;

        if (!payload.packageId) {
            throw new AppError(httpStatus.BAD_REQUEST, "Package ID is required to generate a license.");
        }

        // Generate Key
        payload.key = generateLicenseKey();
        payload.activationDate = new Date();

        // 💰 Dynamic Pricing Calculation (State-Aware Merged State)
        const pricing = await calculateLicensePricing(payload.packageId.toString(), payload.customModules, payload.overriddenLimits);

        payload.billingCycle = pricing.billingCycle;
        payload.nextBillingDate = calculateNextBillingDate(payload.activationDate, pricing.billingCycle);
        payload.totalPrice = pricing.totalPrice;
        payload.priceBreakdown = pricing.priceBreakdown;
        payload.overriddenLimits = pricing.overriddenLimits;

        console.log("💎 Creating License | clientId:", payload.clientId, "| packageId:", payload.packageId);

        // Final Safeguard: Explicitly cast to ObjectId if it's a string
        if (typeof payload.clientId === 'string') {
            payload.clientId = new Types.ObjectId(payload.clientId);
        }

        if (!payload.clientId) {
            throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "License Generation Aborted: Resolved Client ID is null or missing.");
        }

        const result = await License.create(payload as ILicense);

        // 🔄 Sync Modules Immediately (Nirvhul Implementation)
        await syncModulesToTarget(result);

        console.log("✅ License created and modules synced.");
        return result;
    } catch (error: any) {
        console.error("❌ License Creation Failed:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err: any) => err.message);
            throw new AppError(httpStatus.BAD_REQUEST, `License Validation Error: ${messages.join(', ')}`);
        }
        throw error;
    }
};

const getAllLicenses = async () => {
    const result = await License.find().populate('packageId');
    return result;
};

const getLicenseByKey = async (key: string) => {
    const result = await License.findOne({ key }).populate('packageId');
    if (!result) throw new AppError(httpStatus.NOT_FOUND, 'License not found');
    return result;
};

const revokeLicense = async (id: string) => {
    const result = await License.findByIdAndUpdate(id, { status: 'revoked' }, { new: true });
    if (!result) throw new AppError(httpStatus.NOT_FOUND, 'License not found');
    return result;
};

const updateLicense = async (licenseId: string, payload: Partial<ILicense>) => {
    try {
        console.log(`♻️  Attempting update for License: ${licenseId}`);
        // 🛡️ Prevent key update safely & sanitize
        delete (payload as any).key;

        // Fetch existing license for root state
        const existingLicense = await License.findById(licenseId).populate('packageId');
        if (!existingLicense) throw new AppError(httpStatus.NOT_FOUND, 'License to update not found');

        const pkg = existingLicense.packageId as any;

        // 🛠️ Robust ID Resolution for Updates
        // Check for common identity fields in payload
        const rawId = payload.clientId || (payload as any).companyId || (payload as any).company;

        if (rawId !== undefined && rawId !== null && rawId !== "") {
            const resolved = await resolveBusinessUnitId(rawId);
            payload.clientId = resolved.id;
            payload.clientName = resolved.name;
        } else {
            // CRITICAL: Guarantee consistency. Do NOT let clientId be removed or invalidated.
            payload.clientId = (existingLicense.clientId as any)?._id || existingLicense.clientId;
            payload.clientName = existingLicense.clientName;
        }

        // 💰 Pricing Recalculation (State-Aware Merged State)
        // We recalculate if modules, limits, OR the packageId changes
        if (payload.customModules || payload.overriddenLimits || payload.packageId) {
            console.log("💰 Configuration change detected, recalculating merged price...");

            // MERGE State: Current modules in DB + New Changes from Frontend
            const mergedModules = {
                ...(existingLicense.customModules || {}),
                ...(payload.customModules || {})
            };

            const pricing = await calculateLicensePricing(
                (payload.packageId?.toString() || pkg._id.toString()),
                mergedModules,
                payload.overriddenLimits || existingLicense.overriddenLimits
            );

            payload.totalPrice = pricing.totalPrice;
            payload.priceBreakdown = pricing.priceBreakdown;
            payload.overriddenLimits = pricing.overriddenLimits;
        }

        console.log("🚀 Saving update to database with clientId:", payload.clientId);
        const result = await License.findByIdAndUpdate(licenseId, { $set: payload }, { new: true, runValidators: true });

        // 🔄 Sync Modules Immediately (Nirvhul Implementation)
        if (result) {
            await syncModulesToTarget(result);
        }

        return result;
    } catch (error: any) {
        console.error("❌ License Update Denied:", error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err: any) => err.message);
            throw new AppError(httpStatus.BAD_REQUEST, `License Update Validation Failed: ${messages.join(', ')}`);
        }
        throw error;
    }
};

const handleLicenseExpirations = async (): Promise<{ updated: number, emailed: number }> => {
    const now = new Date();
    let updatedCount = 0;
    let emailedCount = 0;

    // 1. Find all active licenses that have passed their billing date
    const expiredLicenses = await License.find({
        status: 'active',
        nextBillingDate: { $lt: now }
    }).populate('packageId');

    for (const license of expiredLicenses) {
        const pkg = license.packageId as any;
        const gracePeriodDays = pkg?.gracePeriodDays || 0;

        const gracePeriodExpiry = new Date(license.nextBillingDate!);
        gracePeriodExpiry.setDate(gracePeriodExpiry.getDate() + gracePeriodDays);

        // Fetch Business Unit/Company contact for email
        const bu = await BusinessUnit.findById(license.clientId).populate('company');
        const contactEmail = bu?.contact?.email || (bu?.company as any)?.contact?.email;

        if (now > gracePeriodExpiry) {
            // A. HARD EXPIRY -> SUSPEND
            license.status = 'suspended';
            await license.save();
            updatedCount++;

            if (contactEmail) {
                await QueueService.addJob(QUEUE_NAMES.EMAIL, 'subscription-suspended', {
                    to: contactEmail,
                    subject: 'Action Required: Your Subscription has been Suspended',
                    template: 'subscription_suspended',
                    context: {
                        clientName: license.clientName,
                        planName: pkg?.name,
                        expiryDate: license.nextBillingDate?.toLocaleDateString()
                    }
                });
                emailedCount++;
            }
        } else {
            // B. SOFT EXPIRY -> WITHIN GRACE PERIOD (Send Reminder)
            if (contactEmail) {
                await QueueService.addJob(QUEUE_NAMES.EMAIL, 'subscription-grace-period', {
                    to: contactEmail,
                    subject: 'Final Reminder: Your Subscription Payment is Overdue',
                    template: 'subscription_reminder',
                    context: {
                        clientName: license.clientName,
                        planName: pkg?.name,
                        dueDate: license.nextBillingDate?.toLocaleDateString(),
                        graceEndDate: gracePeriodExpiry.toLocaleDateString()
                    }
                });
                emailedCount++;
            }
        }
    }

    return { updated: updatedCount, emailed: emailedCount };
};

export const LicenseService = {
    createLicense,
    getAllLicenses,
    getLicenseByKey,
    updateLicense,
    revokeLicense,
    handleLicenseExpirations,
    calculateLicensePricing
};
