export interface IStoreBranding {
  name: string;
  description: string;
  descriptionBangla?: string;
  logo: string;
  banner?: string;
  favicon?: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
  };
}

export interface IStoreContact {
  email: string;
  phone: string;
  supportHours: string;
  supportPhone?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    linkedin?: string;
  };
}

export interface IStoreLocation {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  timezone: string;
}

export interface IStoreSeo {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  canonicalUrl?: string;
  ogImage?: string;
  structuredData?: any;
}

export interface IStorePolicy {
  returnPolicy: string;
  shippingPolicy: string;
  privacyPolicy: string;
  termsOfService: string;
  warrantyPolicy?: string;
  refundPolicy?: string;
}

export interface IStorePerformance {
  responseRate: number;
  fulfillmentRate: number;
  onTimeDeliveryRate: number;
  customerSatisfaction: number;
  productQualityScore: number;
  overallScore: number;
}