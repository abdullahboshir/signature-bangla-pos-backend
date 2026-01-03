import { Schema, model } from "mongoose";
import type { IStaff } from "./staff.interface.js";
import { cachingMiddleware } from "@core/utils/cacheQuery.ts";

const WorkingHoursSchema = new Schema({
    start: {
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
    },
    end: {
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
    },
    timezone: {
        type: String,
        required: true,
        default: 'UTC'
    }
}, { _id: false });

const RestrictionsSchema = new Schema({
    maxDiscountPercentage: {
        type: Number,
        min: 0,
        max: 100
    },
    allowedCategories: [{
        type: Schema.Types.ObjectId,
        ref: 'Category'
    }],
    workingHours: WorkingHoursSchema
}, { _id: false });

const StaffSchema = new Schema<IStaff>({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    lastName: {
        type: String,
        trim: true,
        maxlength: 50
    },
    designation: {
        type: String,
        required: true,
        trim: true
    },
    department: {
        type: String,
        trim: true
    },
    // Modules relevancy for this staff (e.g. Sales Staff -> POS, Warehouse Staff -> Logistics)
    associatedModules: [{
        type: String,
        enum: ['pos', 'erp', 'hrm', 'ecommerce', 'crm', 'logistics', 'system']
    }],
    joiningDate: {
        type: Date
    },
    salary: {
        type: Number,
        min: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    businessUnit: {
        type: Schema.Types.ObjectId,
        ref: 'BusinessUnit',
        required: true
    },
    assignedOutlets: [{
        type: Schema.Types.ObjectId,
        ref: 'Outlet'
    }],
    restrictions: RestrictionsSchema
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
StaffSchema.index({ user: 1 });
StaffSchema.index({ businessUnit: 1 });
StaffSchema.index({ designation: 1 });
StaffSchema.index({ isActive: 1 });
StaffSchema.index({ isDeleted: 1 });

// Virtual for fullName
StaffSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName || ''}`.trim();
});

cachingMiddleware(StaffSchema);

export const Staff = model<IStaff>('Staff', StaffSchema);
