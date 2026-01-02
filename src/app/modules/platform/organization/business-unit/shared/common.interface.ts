export interface IBusinessUnitBranding {
  name: string;
  description?: string;
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

export interface IBusinessUnitContact {
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

export interface IBusinessUnitLocation {
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

export interface IBusinessUnitSeo {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  canonicalUrl?: string;
  ogImage?: string;
  structuredData?: any;
}

export interface IBusinessUnitPolicy {
  returnPolicy: string;
  shippingPolicy: string;
  privacyPolicy: string;
  termsOfService: string;
  warrantyPolicy?: string;
  refundPolicy?: string;
}

export interface IBusinessUnitPerformance {
  responseRate: number;
  fulfillmentRate: number;
  onTimeDeliveryRate: number;
  customerSatisfaction: number;
  productQualityScore: number;
  overallScore: number;
}