import type { Document, Types } from "mongoose";

export interface ICashRegister extends Document {
    registerId: string; // REG-OUTLET-DATE-SEQ
    company: Types.ObjectId;
    businessUnit: Types.ObjectId;
    outlet: Types.ObjectId;

    // Shift Info
    openedBy: Types.ObjectId;
    openingDate: Date;
    openingBalance: number;

    closedBy?: Types.ObjectId;
    closingDate?: Date;
    closingBalance?: number; // Actual Cash Counted

    // System totals for verification
    systemExpectedBalance?: number;
    difference?: number; // closingBalance - systemExpectedBalance (Shortage/Excess)

    status: 'open' | 'closed';
    remarks?: string;

    // Optional: Array of denomination breakdown if needed later
    // denominations?: { note: number, count: number }[];
}

export type ICashRegisterDocument = ICashRegister & Document;
