import { Schema, model } from "mongoose";
import type { IBusinessUnitSettingsDocument, IBusinessUnitSettingsModel } from "./settings.interface.js";
import { displaySettingsSchema } from "./general/display.schema.js";
import { checkoutSettingsSchema } from "./commerce/checkout.schema.js";
import { shippingSettingsSchema } from "./commerce/shipping.schema.js";
import { taxSettingsSchema } from "./finance/tax.schema.js";
import { paymentSettingsSchema } from "./finance/payment.schema.js";
import { notificationSettingsSchema } from "./general/notification.schema.js";
import { securitySettingsSchema } from "./general/security.schema.js";
import { maintenanceSettingsSchema } from "./general/maintenance.schema.js";
import { seoSettingsSchema } from "./general/seo.schema.js";
import { socialSettingsSchema } from "./general/social.schema.js";
import { prefixesSettingsSchema } from "./finance/prefixes.schema.js";
import { posSettingsSchema } from "./pos/pos.schema.js";
import { inventorySettingsSchema } from "./commerce/inventory.schema.js";
import { rewardPointsSettingsSchema } from "./commerce/reward-points.schema.js";
import { hrmSettingsSchema } from "./hrm/hrm.schema.js";


const businessUnitSettingsSchema = new Schema<IBusinessUnitSettingsDocument, IBusinessUnitSettingsModel>({
  businessUnit: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true, unique: true },

  display: displaySettingsSchema,
  checkout: checkoutSettingsSchema,
  shipping: shippingSettingsSchema,
  tax: taxSettingsSchema,
  payment: paymentSettingsSchema,
  notifications: notificationSettingsSchema,
  security: securitySettingsSchema,
  maintenance: maintenanceSettingsSchema,
  seo: seoSettingsSchema,
  social: socialSettingsSchema,
  prefixes: prefixesSettingsSchema,
  pos: posSettingsSchema,
  inventory: inventorySettingsSchema,
  rewardPoints: rewardPointsSettingsSchema,
  hrm: hrmSettingsSchema

}, {
  timestamps: true
});

// Indexes
businessUnitSettingsSchema.index({ businessUnit: 1 });

// Static Methods
businessUnitSettingsSchema.statics['getDefaultSettings'] = function (): Partial<IBusinessUnitSettingsDocument> {
  return {
    display: {
      showOutOfStock: true,
      showStockQuantity: true,
      showProductReviews: true,
      showRelatedProducts: true,
      productsPerPage: 24,
      defaultSort: "newest",
      enableQuickView: true,
      enableWishlist: true,
      enableCompare: true
    },
    checkout: {
      guestCheckout: true,
      requireAccount: false,
      enableCoupons: true,
      enableGiftCards: true,
      termsAndConditions: "Default terms...",
      privacyPolicy: "Default privacy policy..."
    },
    shipping: {
      enabled: true,
      calculation: "flat",
      defaultRate: 0,
      freeShippingEnabled: false,
      handlingFee: 0,
      processingTime: 2,
      shippingZones: []
    },
    tax: {
      enabled: true,
      pricesIncludeTax: false,
      taxBasedOn: "businessUnit",
      taxClasses: []
    },
    payment: {
      acceptedMethods: ["card", "cash", "bank", "mobile"],
      cashOnDelivery: true,
      bankTransfer: true,
      mobileBanking: true,
      autoCapture: true
    },
    notifications: {
      email: {
        newOrders: true,
        lowStock: true,
        newReviews: true,
        customerQueries: true
      },
      push: {
        newOrders: true,
        importantUpdates: true
      },
      sms: {
        orderUpdates: false,
        securityAlerts: true
      }
    },
    security: {
      enableHttps: true,
      enableCaptcha: false,
      blockFailedLogins: true,
      sessionTimeout: 60,
      ipBlacklist: []
    },
    maintenance: {
      enableMaintenanceMode: false,
      allowAdmins: true
    },
    seo: {
      metaRobots: 'index, follow',
      canonicalUrls: true,
      structuredData: true,
      twitterCard: true,
      openGraph: true,
      sitemap: {
        enabled: true,
        frequency: "weekly",
        priority: 0.8
      }
    },
    social: {
      shareButtons: true,
      socialLogin: false,
      socialProof: {
        showPurchaseNotifications: true,
        showReviewCount: true,
        showVisitorCount: false
      }
    },
    prefixes: {
      invoice: "INV-",
      order: "ORD-",
      purchase: "PUR-",
      sku: "SKU-"
    },
    pos: {
      defaultCustomer: "walk-in",
      disableSuspend: false,
      enableCredit: false,
      receiptLayout: "thermal",
      soundEffects: true,
      receiptHeader: "",
      receiptFooter: "",
      showLogo: true,
      logoPosition: "top"
    },
    inventory: {
      allowNegativeStock: false,
      enableLowStockAlerts: true,
      lowStockThreshold: 5,
      barcodeFormat: "CODE128"
    },
    rewardPoints: {
      enabled: false,
      pointsPerCurrency: 1,
      currencyPerPoint: 0.01,
      minimumRedemption: 100,
      expiryPeriod: 12
    },
    hrm: {
      attendance: {
        enableBiometric: false,
        gracePeriodMinutes: 15,
        overtimeCalculation: true,
        workDays: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday']
      },
      payroll: {
        currency: 'BDT',
        autoGenerate: false,
        payCycle: 'monthly'
      },
      leave: {
        annualLeaveDays: 14,
        sickLeaveDays: 10,
        casualLeaveDays: 10,
        carryForwardLimit: 5
      }
    }
  };
};

export const BusinessUnitSettings = model<IBusinessUnitSettingsDocument, IBusinessUnitSettingsModel>('BusinessUnitSettings', businessUnitSettingsSchema);