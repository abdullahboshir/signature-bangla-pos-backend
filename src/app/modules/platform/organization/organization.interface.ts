import { Document, Model } from 'mongoose';
import type { ISharedBranding, ISharedContact, ISharedLocation } from './shared/common.interface.js';
import type { IOrganizationSettings } from './settings/settings.interface.js';

// ====== TENANT CONFIGURATION (Hybrid Multi-Tenancy) ======
export type DeploymentType = 'shared' | 'dedicated';

export interface ITenantConfig {
  deploymentType: DeploymentType;
  customDomain?: string;       // e.g., 'client.theircompany.com'
  databaseUri?: string;        // Dedicated DB URI (encrypted at rest)
  storageConfig?: {
    provider?: 'cloudinary' | 's3' | 'local';
    // Cloudinary specific
    cloudName?: string;
    apiKey?: string;
    apiSecret?: string;
    // S3 specific
    bucket?: string;
    region?: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    // Common
    cdnUrl?: string;
    basePath?: string; // Custom folder prefix
  };
  isProvisioned?: boolean;     // Has the dedicated environment been set up?
  provisionedAt?: Date;
}

export interface IOrganization {
  branding: ISharedBranding;
  name: string;
  contact: ISharedContact;
  location: ISharedLocation;
  slug: string;

  registrationNumber: string;

  // Business Details
  businessType: 'proprietorship' | 'partnership' | 'private_limited' | 'public_limited' | 'ngo' | 'cooperative';
  establishedDate?: Date;
  numberOfEmployees?: number;

  // Legal Representative
  legalRepresentative?: {
    name?: string;
    designation?: string;
    contactPhone?: string;
    email?: string;
    nationalId?: string;
  };

  // Authorized Capital (for Pvt/Public Ltd)
  capital?: {
    authorizedCapital?: number;
    paidUpCapital?: number;
    shareCapital?: number;
    currency?: string;
  };

  // Ownership & Governance
  shareholders?: Array<{
    name: string;
    sharePercentage: number;
    nidOrPassport?: string;
  }>;
  directors?: Array<{
    name: string;
    designation: string;
    nidOrPassport?: string;
    isManagingDirector?: boolean;
  }>;

  isActive: boolean;
  activeModules?: {
    pos: boolean;
    erp: boolean;
    hrm: boolean;
    ecommerce: boolean;
    crm: boolean;
    logistics: boolean;
    finance: boolean;
    marketing: boolean;
    integrations: boolean;
    governance: boolean;
    saas: boolean;
  };

  // ====== TENANT CONFIGURATION ======
  tenantConfig?: ITenantConfig;

  // Virtuals
  settings?: IOrganizationSettings;
}


export interface IOrganizationDocument extends IOrganization, Document { }

export interface IOrganizationModel extends Model<IOrganizationDocument> { }
