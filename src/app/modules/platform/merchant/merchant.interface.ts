import type { Types } from "mongoose";

/**
 * Industrial Standard Merchant Interface
 * Represents the profile of a Organization Owner
 */
export interface IMerchant {
    _id?: Types.ObjectId;
    user: Types.ObjectId; // Link to the Auth User
    firstName: string;
    lastName?: string;
    profileImage?: string;
    phone?: string;
    isEmailVerified: boolean;
    nidNumber?: string;
    tinNumber?: string; // Tax Identification Number
    dateOfBirth?: Date;
    gender?: 'male' | 'female' | 'other';
    emergencyContact?: {
        name: string;
        phone: string;
        relation: string;
    };
    address?: {
        street?: string;
        city?: string;
        state?: string;
        zip?: string;
        country?: string;
    };
    isActive: boolean;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}
