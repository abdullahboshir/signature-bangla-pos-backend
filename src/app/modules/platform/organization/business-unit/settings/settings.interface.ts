import type { Document, Model, Types } from "mongoose";

export interface IBusinessUnitSettings {
  businessUnit: Types.ObjectId;

  // Display Settings
  display: {
    showOutOfStock: boolean;
    showStockQuantity: boolean;
    showProductReviews: boolean;
    showRelatedProducts: boolean;
    productsPerPage: number;
    defaultSort: "newest" | "popular" | "price_low" | "price_high" | "rating";
    enableQuickView: boolean;
    enableWishlist: boolean;
    enableCompare: boolean;
  };

  // Checkout Settings
  checkout: {
    guestCheckout: boolean;
    requireAccount: boolean;
    enableCoupons: boolean;
    enableGiftCards: boolean;
    minimumOrderAmount?: number;
    termsAndConditions: string;
    privacyPolicy: string;
  };

  // Shipping Settings
  shipping: {
    enabled: boolean;
    calculation: "flat" | "weight" | "price" | "free";
    defaultRate: number;
    freeShippingEnabled: boolean;
    freeShippingMinimum?: number;
    handlingFee: number;
    processingTime: number; // days
    shippingZones: {
      name: string;
      countries: string[];
      regions?: string[];
      rates: {
        minWeight?: number;
        maxWeight?: number;
        minPrice?: number;
        maxPrice?: number;
        cost: number;
      }[];
    }[];
  };

  // Tax Settings
  tax: {
    enabled: boolean;
    pricesIncludeTax: boolean;
    taxBasedOn: "shipping" | "billing" | "businessUnit";
    taxClasses: {
      name: string;
      rate: number;
      countries: string[];
      states?: string[];
    }[];
  };

  // Payment Settings
  payment: {
    acceptedMethods: ("card" | "cash" | "bank" | "mobile" | "digital")[];
    cashOnDelivery: boolean;
    bankTransfer: boolean;
    mobileBanking: boolean;
    autoCapture: boolean;
    paymentInstructions?: string;
  };

  // Notification Settings
  notifications: {
    email: {
      newOrders: boolean;
      lowStock: boolean;
      newReviews: boolean;
      customerQueries: boolean;
    };
    push: {
      newOrders: boolean;
      importantUpdates: boolean;
    };
    sms: {
      orderUpdates: boolean;
      securityAlerts: boolean;
    };
  };

  // Security Settings
  security: {
    enableHttps: boolean;
    enableCaptcha: boolean;
    blockFailedLogins: boolean;
    sessionTimeout: number; // minutes
    ipBlacklist: string[];
  };

  // Maintenance Settings
  maintenance: {
    enableMaintenanceMode: boolean;
    maintenanceMessage?: string;
    allowAdmins: boolean;
    scheduledMaintenance?: {
      start: Date;
      end: Date;
      message: string;
    };
  };

  // SEO Settings
  seo: {
    metaRobots: string;
    canonicalUrls: boolean;
    structuredData: boolean;
    twitterCard: boolean;
    openGraph: boolean;
    sitemap: {
      enabled: boolean;
      frequency: "daily" | "weekly" | "monthly";
      priority: number;
    };
  };

  // Social Media Settings
  social: {
    shareButtons: boolean;
    socialLogin: boolean;
    facebookAppId?: string;
    googleClientId?: string;
    socialProof: {
      showPurchaseNotifications: boolean;
      showReviewCount: boolean;
      showVisitorCount: boolean;
    };
  };

  // Prefixes
  prefixes: {
    invoice: string;
    order: string;
    purchase: string;
    sku: string;
  };

  // POS Settings
  pos: {
    defaultCustomer: Types.ObjectId | string; // ID or 'walk-in'
    disableSuspend: boolean;
    enableCredit: boolean;
    receiptLayout: "simple" | "detailed" | "thermal";
    soundEffects: boolean;
    // Receipt Customization
    receiptHeader?: string;
    receiptFooter?: string;
    showLogo: boolean;
    logoPosition: "top" | "bottom";
  };

  // Inventory Settings
  inventory: {
    allowNegativeStock: boolean;
    enableLowStockAlerts: boolean;
    lowStockThreshold: number;
    barcodeFormat: "EAN13" | "UPCA" | "CODE128";
  };

  // Reward Points
  rewardPoints: {
    enabled: boolean;
    pointsPerCurrency: number; // How many points earned per 1 currency unit
    currencyPerPoint: number; // Redemption value of 1 point
    minimumRedemption: number;
    expiryPeriod: number; // months
  };

  // HRM Settings
  hrm: {
    attendance: {
      enableBiometric: boolean;
      gracePeriodMinutes: number;
      overtimeCalculation: boolean;
      workDays: string[];
    };
    payroll: {
      currency: string;
      autoGenerate: boolean;
      payCycle: "monthly" | "weekly";
    };
    leave: {
      annualLeaveDays: number;
      sickLeaveDays: number;
      casualLeaveDays: number;
      carryForwardLimit: number;
    };
  };

  createdAt: Date;
  updatedAt: Date;
}

export type IBusinessUnitSettingsDocument = IBusinessUnitSettings & Document & {
  enableMaintenanceMode(message?: string): Promise<void>;
  disableMaintenanceMode(): Promise<void>;
  isInMaintenance(): boolean;
  calculateShipping(weight: number, price: number, destination: string): number;
  validatePaymentMethod(method: string): boolean;
  getTaxRate(country: string, state?: string): number;
};

export interface IBusinessUnitSettingsModel extends Model<IBusinessUnitSettingsDocument> {
  getDefaultSettings(): Partial<IBusinessUnitSettings>;
}