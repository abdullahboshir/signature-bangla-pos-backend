import { Schema } from "mongoose";

export const displaySettingsSchema = new Schema({
    showOutOfStock: { type: Boolean, default: true },
    showStockQuantity: { type: Boolean, default: true },
    showProductReviews: { type: Boolean, default: true },
    showRelatedProducts: { type: Boolean, default: true },
    productsPerPage: { type: Number, default: 24, min: 12, max: 100 },
    defaultSort: {
        type: String,
        enum: ["newest", "popular", "price_low", "price_high", "rating"],
        default: "newest"
    },
    enableQuickView: { type: Boolean, default: true },
    enableWishlist: { type: Boolean, default: true },
    enableCompare: { type: Boolean, default: true }
}, { _id: false });
