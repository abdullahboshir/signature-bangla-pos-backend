import { Schema, model } from "mongoose";
import type { IProductQADocument } from "./product-questions.interface.ts";

const productQASchema = new Schema<IProductQADocument>({
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    question: { type: String, required: true, trim: true, minlength: 5, maxlength: 500 },

    answer: { type: String, trim: true, maxlength: 1000 },
    answeredBy: { type: Schema.Types.ObjectId, ref: 'User' },
    answeredAt: { type: Date },

    status: {
        type: String,
        enum: ["pending", "answered", "rejected"],
        default: "pending",
        index: true
    },
    isPublic: { type: Boolean, default: true },

    likes: { type: Number, default: 0 }
}, {
    timestamps: true
});

// Indexes for fast retrieval
productQASchema.index({ product: 1, isPublic: 1, createdAt: -1 }); // Get public Q&A for a product
productQASchema.index({ user: 1 });
productQASchema.index({ answeredBy: 1 });

export const ProductQA = model<IProductQADocument>('ProductQA', productQASchema);
