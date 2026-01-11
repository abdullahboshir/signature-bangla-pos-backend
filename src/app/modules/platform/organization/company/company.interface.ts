import { Document, Model } from 'mongoose';
import type { ISharedBranding, ISharedContact, ISharedLocation } from '../shared/common.interface.js';
import type { ICompanySettings } from './settings/settings.interface.js';

export interface ICompany {
  branding: ISharedBranding;
  name: string;
  contact: ISharedContact;
  location: ISharedLocation;

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

  // Virtuals
  settings?: ICompanySettings;
}


export interface ICompanyDocument extends ICompany, Document { }

export interface ICompanyModel extends Model<ICompanyDocument> { }
