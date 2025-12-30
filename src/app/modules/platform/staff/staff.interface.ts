import { Document, Types } from "mongoose";

export interface IWorkingHours {
    start: string;
    end: string;
    timezone: string;
}

export interface IRestrictions {
    maxDiscountPercentage?: number;
    allowedCategories?: Types.ObjectId[];
    workingHours?: IWorkingHours;
}

export interface IStaff extends Document {
    user: Types.ObjectId;
    firstName: string;
    lastName: string;
    designation: string;
    department?: string;
    joiningDate?: Date;
    salary?: number;
    isActive: boolean;
    isDeleted: boolean;
    businessUnit: Types.ObjectId; // Primary Business Unit
    assignedOutlets?: Types.ObjectId[]; // Outlets they can access
    restrictions?: IRestrictions;
    createdAt: Date;
    updatedAt: Date;
}
