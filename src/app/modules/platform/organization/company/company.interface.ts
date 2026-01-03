import { Document, Model } from 'mongoose';

export interface ICompany {
  name: string;
  registrationNumber: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  logo?: string;
  website?: string;
  isActive: boolean;
  activeModules?: {
    pos: boolean;
    erp: boolean;
    hrm: boolean;
    ecommerce: boolean;
    crm: boolean;
    logistics: boolean;
  };
}

export interface ICompanyDocument extends ICompany, Document { }

export interface ICompanyModel extends Model<ICompanyDocument> { }
