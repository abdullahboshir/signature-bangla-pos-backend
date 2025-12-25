import { Document, Types } from "mongoose";

export interface IProductQA {
    product: Types.ObjectId;
    user: Types.ObjectId; // Customer who asked
    question: string;

    answer?: string;
    answeredBy?: Types.ObjectId; // Vendor or Admin
    answeredAt?: Date;

    status: "pending" | "answered" | "rejected";
    isPublic: boolean; // Only public Q&A visible on product page

    likes: number; // For helpful questions

    createdAt: Date;
    updatedAt: Date;
}

export type IProductQADocument = IProductQA & Document;
