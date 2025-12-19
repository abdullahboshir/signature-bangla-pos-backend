import { Schema, model } from "mongoose";
import type { IStoreSettingsDocument, IStoreSettingsModel } from "./store-settings.interface.js";

const storeSettingsSchema = new Schema<IStoreSettingsDocument, IStoreSettingsModel>({
  store: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true, unique: true },

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
      enum: ["shipping", "billing", "store"],
      default: "store"
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
  }
}, {
  timestamps: true
});

// Indexes
storeSettingsSchema.index({ store: 1 });

// Instance Methods
// storeSettingsSchema.methods.enableMaintenanceMode = async function(message?: string): Promise<void> {
//   this.maintenance.enableMaintenanceMode = true;
//   this.maintenance.maintenanceMessage = message;
//   await this.save();
// };

// storeSettingsSchema.methods.disableMaintenanceMode = async function(): Promise<void> {
//   this.maintenance.enableMaintenanceMode = false;
//   this.maintenance.maintenanceMessage = undefined;
//   await this.save();
// };

// storeSettingsSchema.methods.isInMaintenance = function(): boolean {
//   if (!this.maintenance.enableMaintenanceMode) return false;

//   // Check for scheduled maintenance
//   if (this.maintenance.scheduledMaintenance) {
//     const now = new Date();
//     const start = this.maintenance.scheduledMaintenance.start;
//     const end = this.maintenance.scheduledMaintenance.end;

//     if (now >= start && now <= end) {
//       return true;
//     }
//   }

//   return this.maintenance.enableMaintenanceMode;
// };

// storeSettingsSchema.methods.calculateShipping = function(
//   weight: number, 
//   price: number, 
//   destination: string
// ): number {
//   if (!this.shipping.enabled) return 0;

//   // Check for free shipping
//   if (this.shipping.freeShippingEnabled && this.shipping.freeShippingMinimum && price >= this.shipping.freeShippingMinimum) {
//     return 0;
//   }

//   // Find applicable shipping zone
//   const zone = this.shipping.shippingZones.find(z => 
//     z.countries.includes(destination)
//   );

//   if (!zone) return this.shipping.defaultRate;

//   // Find applicable rate
//   const rate = zone.rates.find(r => {
//     const weightMatch = (!r.minWeight || weight >= r.minWeight) && (!r.maxWeight || weight <= r.maxWeight);
//     const priceMatch = (!r.minPrice || price >= r.minPrice) && (!r.maxPrice || price <= r.maxPrice);
//     return weightMatch && priceMatch;
//   });

//   return rate ? rate.cost : this.shipping.defaultRate;
// };

// storeSettingsSchema.methods.validatePaymentMethod = function(method: string): boolean {
//   return this.payment.acceptedMethods.includes(method);
// };

// storeSettingsSchema.methods.getTaxRate = function(country: string, state?: string): number {
//   if (!this.tax.enabled) return 0;

//   const taxClass = this.tax.taxClasses.find(tc => {
//     const countryMatch = tc.countries.includes(country);
//     const stateMatch = !state || !tc.states || tc.states.length === 0 || tc.states.includes(state);
//     return countryMatch && stateMatch;
//   });

//   return taxClass ? taxClass.rate : 0;
// };

// // Static Methods
// storeSettingsSchema.statics.getDefaultSettings = function(): Partial<IStoreSettings> {
//   return {
//     display: {
//       showOutOfStock: true,
//       showStockQuantity: true,
//       showProductReviews: true,
//       showRelatedProducts: true,
//       productsPerPage: 24,
//       defaultSort: "newest",
//       enableQuickView: true,
//       enableWishlist: true,
//       enableCompare: true
//     },
//     checkout: {
//       guestCheckout: true,
//       requireAccount: false,
//       enableCoupons: true,
//       enableGiftCards: true,
//       termsAndConditions: "Default terms and conditions...",
//       privacyPolicy: "Default privacy policy..."
//     },
//     shipping: {
//       enabled: true,
//       calculation: "flat",
//       defaultRate: 0,
//       freeShippingEnabled: false,
//       handlingFee: 0,
//       processingTime: 2,
//       shippingZones: []
//     },
//     tax: {
//       enabled: true,
//       pricesIncludeTax: false,
//       taxBasedOn: "store",
//       taxClasses: []
//     },
//     payment: {
//       acceptedMethods: ["card", "cash", "bank", "mobile"],
//       cashOnDelivery: true,
//       bankTransfer: true,
//       mobileBanking: true,
//       autoCapture: true
//     },
//     notifications: {
//       email: {
//         newOrders: true,
//         lowStock: true,
//         newReviews: true,
//         customerQueries: true
//       },
//       push: {
//         newOrders: true,
//         importantUpdates: true
//       },
//       sms: {
//         orderUpdates: false,
//         securityAlerts: true
//       }
//     },
//     security: {
//       enableHttps: true,
//       enableCaptcha: false,
//       blockFailedLogins: true,
//       sessionTimeout: 60,
//       ipBlacklist: []
//     },
//     maintenance: {
//       enableMaintenanceMode: false,
//       allowAdmins: true
//     },
//     seo: {
//       metaRobots: 'index, follow',
//       canonicalUrls: true,
//       structuredData: true,
//       twitterCard: true,
//       openGraph: true,
//       sitemap: {
//         enabled: true,
//         frequency: "weekly",
//         priority: 0.8
//       }
//     },
//     social: {
//       shareButtons: true,
//       socialLogin: false,
//       socialProof: {
//         showPurchaseNotifications: true,
//         showReviewCount: true,
//         showVisitorCount: false
//       }
//     }
//   };
// };

export const StoreSettings = model<IStoreSettingsDocument, IStoreSettingsModel>('StoreSettings', storeSettingsSchema);