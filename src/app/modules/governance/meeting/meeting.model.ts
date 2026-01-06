import { Schema, model } from "mongoose";

export interface IMeeting {
    title: string;
    agenda: string; // Markdown or text
    date: Date;
    durationMinutes: number;
    location: string; // "Board Room A" or "Zoom Link"
    attendees: {
        shareholder: Schema.Types.ObjectId;
        status: 'pending' | 'accepted' | 'declined' | 'attended' | 'absent';
    }[];
    minutes?: string; // Post-meeting summary
    businessUnit: Schema.Types.ObjectId;
    status: 'scheduled' | 'cancelled' | 'completed';
    createdBy: Schema.Types.ObjectId;
}

const meetingSchema = new Schema<IMeeting>({
    title: { type: String, required: true },
    agenda: { type: String, required: true },
    date: { type: Date, required: true },
    durationMinutes: { type: Number, default: 60 },
    location: { type: String, required: true },
    attendees: [{
        shareholder: { type: Schema.Types.ObjectId, ref: 'Shareholder' },
        status: { type: String, enum: ['pending', 'accepted', 'declined', 'attended', 'absent'], default: 'pending' }
    }],
    minutes: { type: String }, // Can be filled later
    businessUnit: { type: Schema.Types.ObjectId, ref: 'BusinessUnit', required: true },
    status: { type: String, enum: ['scheduled', 'cancelled', 'completed'], default: 'scheduled' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
    timestamps: true
});

export const Meeting = model<IMeeting>('Meeting', meetingSchema);
