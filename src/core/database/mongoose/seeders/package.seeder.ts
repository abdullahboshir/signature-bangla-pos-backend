
import { Package } from "@app/modules/platform/package/package.model.ts";
import { type IPackage } from "@app/modules/platform/package/package.interface.ts";

const packages: Partial<IPackage>[] = [
    {
        name: 'Trial Plan',
        slug: 'trial',
        description: 'Explore all features for 14 days. Ideal for evaluation.',
        appliesTo: "company",
        trialPeriodDays: 14,
        price: 0,
        currency: 'BDT',
        billingCycle: 'monthly',
        sortOrder: 1,
        isPublic: false,
        highlightText: 'Evaluation Only',
        shortDescription: 'Free 14-day trial of all modules.',
        recommendedFor: 'New businesses exploring the platform.',
        icon: 'Zap',
        headerColor: '#6366f1',
        features: [
            'Full Access to All Modules (POS, ERP, HRM, etc.)',
            'Community Support Only',
            'Restricted Resource Quantity',
            'Upgrade anytime without data loss'
        ],
        moduleAccess: {
            pos: { enabled: true, monthlyPrice: 0 },
            erp: { enabled: true, monthlyPrice: 0 },
            hrm: { enabled: true, monthlyPrice: 0 },
            ecommerce: { enabled: true, monthlyPrice: 0 },
            crm: { enabled: true, monthlyPrice: 0 },
            logistics: { enabled: true, monthlyPrice: 0 },
            accounting: { enabled: true, monthlyPrice: 0 },
            reports: { enabled: true, monthlyPrice: 0 },
            api_access: { enabled: true, monthlyPrice: 0 }
        },
        limits: {
            maxUsers: 2,
            maxBusinessUnits: 1,
            maxOutlets: 2,
            maxStorage: 100,
            maxProducts: 50,
            maxOrders: 100
        },
        status: 'active',
        isActive: true,
        isFeatured: false
    },
    {
        name: 'Standard Startup',
        slug: 'standard',
        description: 'Perfect for established single-location businesses looking to digitize their operations.',
        appliesTo: "company",
        trialPeriodDays: 0,
        price: 999,
        currency: 'BDT',
        billingCycle: 'monthly',
        sortOrder: 2,
        isPublic: true,
        isRecommended: true,
        highlightText: 'Most Popular',
        shortDescription: 'Core business management tools.',
        recommendedFor: 'Small retail shops or local service providers.',
        icon: 'Store',
        headerColor: '#10b981',
        features: [
            'All POS & Inventory Features',
            'Full Accounting Module',
            'Basic Email Support',
            'Up to 5 Users Included'
        ],
        moduleAccess: {
            pos: { enabled: true, monthlyPrice: 0 },
            erp: { enabled: true, monthlyPrice: 0 },
            hrm: { enabled: false, monthlyPrice: 500 },
            ecommerce: { enabled: false, monthlyPrice: 1000 },
            crm: { enabled: false, monthlyPrice: 300 },
            logistics: { enabled: false, monthlyPrice: 500 },
            accounting: { enabled: true, monthlyPrice: 0 },
            reports: { enabled: true, monthlyPrice: 0 },
            api_access: { enabled: false, monthlyPrice: 1000 }
        },
        limits: {
            maxUsers: 5,
            maxBusinessUnits: 1,
            maxOutlets: 1,
            maxStorage: 1000,
            maxProducts: 1000,
            maxOrders: 5000
        },
        status: 'active',
        isActive: true,
        isFeatured: true
    },
    {
        name: 'Enterprise Plus',
        slug: 'enterprise',
        description: 'Multi-outlet management with full ERP & HRM capabilities for large operations.',
        appliesTo: "company",
        trialPeriodDays: 0,
        price: 4999,
        currency: 'BDT',
        billingCycle: 'monthly',
        sortOrder: 3,
        isPublic: true,
        shortDescription: 'Complete suite for multi-branch management.',
        recommendedFor: 'Large chains, supermarkets, or corporate entities.',
        icon: 'Factory',
        headerColor: '#8b5cf6',
        features: [
            'Full ERP & HRM Access Included',
            'Multi-Business Unit & Multi-Branch Support',
            'Priority 24/7 Phone Support',
            'Unlimited Products & Scalability'
        ],
        moduleAccess: {
            pos: { enabled: true, monthlyPrice: 0 },
            erp: { enabled: true, monthlyPrice: 0 },
            hrm: { enabled: true, monthlyPrice: 0 },
            ecommerce: { enabled: true, monthlyPrice: 0 },
            crm: { enabled: true, monthlyPrice: 0 },
            logistics: { enabled: true, monthlyPrice: 0 },
            accounting: { enabled: true, monthlyPrice: 0 },
            reports: { enabled: true, monthlyPrice: 0 },
            api_access: { enabled: true, monthlyPrice: 0 }
        },
        limits: {
            maxUsers: 50,
            maxBusinessUnits: 5,
            maxOutlets: 20,
            maxStorage: 10000,
            maxProducts: -1,
            maxOrders: -1
        },
        status: 'active',
        supportType: "dedicated",
        isActive: true,
        isFeatured: false
    },
    {
        name: 'Lifetime Pro Deal',
        slug: 'lifetime',
        description: 'One-time investment for permanent access to all platform features.',
        appliesTo: "company",
        trialPeriodDays: 0,
        price: 99999,
        currency: 'BDT',
        billingCycle: 'lifetime',
        sortOrder: 4,
        isPublic: true,
        tags: ['Limited Offer', 'Value'],
        shortDescription: 'Zero monthly fees, forever.',
        recommendedFor: 'Founding partners and long-term visionaries.',
        icon: 'Gem',
        headerColor: '#f59e0b',
        features: [
            'Permanent Ownership of License',
            'Zero Recurring Monthly Fees',
            'All Global Modules Included',
            'Priority Lifetime Support'
        ],
        limits: {
            maxUsers: -1,
            maxBusinessUnits: -1,
            maxOutlets: -1,
            maxStorage: -1,
            maxProducts: -1,
            maxOrders: -1
        },
        moduleAccess: {
            pos: { enabled: true, monthlyPrice: 0 },
            erp: { enabled: true, monthlyPrice: 0 },
            hrm: { enabled: true, monthlyPrice: 0 },
            ecommerce: { enabled: true, monthlyPrice: 0 },
            crm: { enabled: true, monthlyPrice: 0 },
            logistics: { enabled: true, monthlyPrice: 0 },
            accounting: { enabled: true, monthlyPrice: 0 },
            reports: { enabled: true, monthlyPrice: 0 },
            api_access: { enabled: true, monthlyPrice: 0 }
        },
        supportType: "priority",
        isActive: true,
        isFeatured: false
    }
];

export const seedPackages = async () => {
    console.log("🌱 [Zenith Sync] Synchronizing Package Data...".blue.bold);

    for (const pkg of packages) {
        try {
            // we use findOneAndUpdate with all fields to ensure data parity on every restart
            const result = await Package.findOneAndUpdate(
                { slug: pkg.slug },
                { $set: pkg }, // $set ensures existing documents get all new fields/updates
                {
                    upsert: true,
                    new: true,
                    setDefaultsOnInsert: true,
                    runValidators: true
                }
            );

            if (result) {
                const displayName = pkg.name || 'Unknown Package';
                console.log(`   ✅ Synced: ${displayName.padEnd(20)} [Slug: ${(pkg.slug || 'unknown').cyan}]`);
            }
        } catch (err: any) {
            console.error(`   ❌ Sync Failed [${pkg.slug}]:`.red, err.message);
        }
    }

    console.log("✨ Package Synchronization Completed Successfully".green.bold);
};
