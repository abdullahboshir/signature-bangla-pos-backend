import { Schema } from "mongoose";

export const seoSettingsSchema = new Schema({
    metaRobots: { type: String, default: 'index, follow' },
    canonicalUrls: { type: Boolean, default: true },
    structuredData: { type: Boolean, default: true },
    twitterCard: { type: Boolean, default: true },
    openGraph: { type: Boolean, default: true },
    sitemap: {
        enabled: { type: Boolean, default: true },
        frequency: {
            type: String,
            enum: ["daily", "weekly", "monthly"],
            default: "weekly"
        },
        priority: { type: Number, default: 0.8, min: 0, max: 1 }
    }
}, { _id: false });
