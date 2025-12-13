import { Types } from "mongoose";

export interface IBrand {
    name: string;
    slug?: string;
    description?: string;
    logo?: string;
    website?: string;
    status: "active" | "inactive";
    businessUnit?: Types.ObjectId; // Optional link to a specific BU if brands are BU-specific, or global
    createdAt?: Date;
    updatedAt?: Date;
}
