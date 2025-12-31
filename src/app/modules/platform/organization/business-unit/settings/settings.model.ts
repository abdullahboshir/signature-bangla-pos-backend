import { Schema, model } from "mongoose";
import type { IBusinessUnitSettingsDocument, IBusinessUnitSettingsModel } from "./settings.interface.js";


const businessUnitSettingsSchema = new Schema<IBusinessUnitSettingsDocument, IBusinessUnitSettingsModel>({
  businessUnit: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true, unique: true },

  // Display Settings
  display: {
    showOutOfStock: { type: Boolean, default: true },
    showStockQuantity: { type: Boolean, default: true },
    showProductReviews: { type: Boolean, default: true },
    showRelatedProducts: { type: Boolean, default: true },
    productsPerPage: { type: Number, default: 24, min: 12, max: 100 },
    defaultSort: {
      type: String,
      enum: ["newest", "popular", "price_low", "price_high", "rating"],
      default: "newest"
    },
    enableQuickView: { type: Boolean, default: true },
    enableWishlist: { type: Boolean, default: true },
    enableCompare: { type: Boolean, default: true }
  },

  // Checkout Settings
  checkout: {
    guestCheckout: { type: Boolean, default: true },
    requireAccount: { type: Boolean, default: false },
    enableCoupons: { type: Boolean, default: true },
    enableGiftCards: { type: Boolean, default: true },
    minimumOrderAmount: { type: Number, min: 0 },
    termsAndConditions: { type: String, required: true },
    privacyPolicy: { type: String, required: true }
  },

  // Shipping Settings
  shipping: {
    enabled: { type: Boolean, default: true },
    calculation: {
      type: String,
      enum: ["flat", "weight", "price", "free"],
      default: "flat"
    },
    defaultRate: { type: Number, default: 0, min: 0 },
    freeShippingEnabled: { type: Boolean, default: false },
    freeShippingMinimum: { type: Number, min: 0 },
    handlingFee: { type: Number, default: 0, min: 0 },
    processingTime: { type: Number, default: 2, min: 1, max: 30 },
    shippingZones: [{
      name: { type: String, required: true },
      countries: [{ type: String, required: true }],
      regions: [{ type: String }],
      rates: [{
        minWeight: { type: Number, min: 0 },
        maxWeight: { type: Number, min: 0 },
        minPrice: { type: Number, min: 0 },
        maxPrice: { type: Number, min: 0 },
        cost: { type: Number, required: true, min: 0 }
      }]
    }]
  },

  // Tax Settings
  tax: {
    enabled: { type: Boolean, default: true },
    pricesIncludeTax: { type: Boolean, default: false },
    taxBasedOn: {
      type: String,
      enum: ["shipping", "billing", "businessUnit"],
      default: "businessUnit"
    },
    taxClasses: [{
      name: { type: String, required: true },
      rate: { type: Number, required: true, min: 0, max: 100 },
      countries: [{ type: String, required: true }],
      states: [{ type: String }]
    }]
  },

  // Payment Settings
  payment: {
    acceptedMethods: [{
      type: String,
      enum: ["card", "cash", "bank", "mobile", "digital"]
    }],
    cashOnDelivery: { type: Boolean, default: true },
    bankTransfer: { type: Boolean, default: true },
    mobileBanking: { type: Boolean, default: true },
    autoCapture: { type: Boolean, default: true },
    paymentInstructions: { type: String }
  },

  // Notification Settings
  notifications: {
    email: {
      newOrders: { type: Boolean, default: true },
      lowStock: { type: Boolean, default: true },
      newReviews: { type: Boolean, default: true },
      customerQueries: { type: Boolean, default: true }
    },
    push: {
      newOrders: { type: Boolean, default: true },
      importantUpdates: { type: Boolean, default: true }
    },
    sms: {
      orderUpdates: { type: Boolean, default: false },
      securityAlerts: { type: Boolean, default: true }
    }
  },

  // Security Settings
  security: {
    enableHttps: { type: Boolean, default: true },
    enableCaptcha: { type: Boolean, default: false },
    blockFailedLogins: { type: Boolean, default: true },
    sessionTimeout: { type: Number, default: 60, min: 5 },
    ipBlacklist: [{ type: String }]
  },

  // Maintenance Settings
  maintenance: {
    enableMaintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: { type: String },
    allowAdmins: { type: Boolean, default: true },
    scheduledMaintenance: {
      start: { type: Date },
      end: { type: Date },
      message: { type: String }
    }
  },

  // SEO Settings
  seo: {
    metaRobots: { type: String, default: 'index, follow' },
    canonicalUrls: { type: Boolean, default: true },
    structuredData: { type: Boolean, default: true },
    twitterCard: { type: Boolean, default: true },
    openGraph: { type: Boolean, default: true },
    sitemap: {
      enabled: { type: Boolean, default: true },
      frequency: {
        type: String,
        enum: ["daily", "weekly", "monthly"],
        default: "weekly"
      },
      priority: { type: Number, default: 0.8, min: 0, max: 1 }
    }
  },

  // Social Media Settings
  social: {
    shareButtons: { type: Boolean, default: true },
    socialLogin: { type: Boolean, default: false },
    facebookAppId: { type: String },
    googleClientId: { type: String },
    socialProof: {
      showPurchaseNotifications: { type: Boolean, default: true },
      showReviewCount: { type: Boolean, default: true },
      showVisitorCount: { type: Boolean, default: false }
    }
  },

  // Prefixes
  prefixes: {
    invoice: { type: String, default: "INV-" },
    order: { type: String, default: "ORD-" },
    purchase: { type: String, default: "PUR-" },
    sku: { type: String, default: "SKU-" }
  },

  // POS Settings
  pos: {
    defaultCustomer: { type: Schema.Types.Mixed, default: "walk-in" },
    disableSuspend: { type: Boolean, default: false },
    enableCredit: { type: Boolean, default: false },
    receiptLayout: { type: String, enum: ["simple", "detailed", "thermal"], default: "thermal" },
    soundEffects: { type: Boolean, default: true },
    // Receipt Customization
    receiptHeader: { type: String },
    receiptFooter: { type: String },
    showLogo: { type: Boolean, default: true },
    logoPosition: { type: String, enum: ["top", "bottom"], default: "top" }
  },

  // Inventory Settings
  inventory: {
    allowNegativeStock: { type: Boolean, default: false },
    enableLowStockAlerts: { type: Boolean, default: true },
    lowStockThreshold: { type: Number, default: 5 },
    barcodeFormat: { type: String, enum: ["EAN13", "UPCA", "CODE128"], default: "CODE128" }
  },

  // Reward Points
  rewardPoints: {
    enabled: { type: Boolean, default: false },
    pointsPerCurrency: { type: Number, default: 1 },
    currencyPerPoint: { type: Number, default: 0.01 },
    minimumRedemption: { type: Number, default: 100 },
    expiryPeriod: { type: Number, default: 12 }
  }
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
    }
  };
};

export const BusinessUnitSettings = model<IBusinessUnitSettingsDocument, IBusinessUnitSettingsModel>('BusinessUnitSettings', businessUnitSettingsSchema);