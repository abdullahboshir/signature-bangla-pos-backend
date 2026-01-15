import { Types } from "mongoose";

export interface IBrand {
    name: string;
    domain: string;
    slug?: string;
    description?: string;
    logo?: string;
    website?: string;
    status: "active" | "inactive";
    availableModules: ('pos' | 'erp' | 'hrm' | 'ecommerce' | 'crm' | 'logistics' | 'system')[];
    businessUnit?: Types.ObjectId; // Optional link to a specific BU if brands are BU-specific, or global
    company?: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}
