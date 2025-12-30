export interface IPurchaseItem {
    product: string; // ObjectId
    quantity: number;
    unitCost: number;
    total: number;
}

export interface IPurchase {
    id: string;
    supplier: string; // ObjectId
    purchaseDate: Date;
    dueDate?: Date;
    referenceNo?: string;
    businessUnit: string; // ObjectId
    outlet: string; // ObjectId
    status: 'pending' | 'ordered' | 'received';
    items: IPurchaseItem[];
    subTotal: number;
    tax?: number;
    shippingCost?: number;
    discount?: number;
    grandTotal: number;
    paidAmount?: number;
    dueAmount?: number;
    paymentMethod?: 'cash' | 'card' | 'bank_transfer' | 'mobile_banking' | 'cheque' | 'credit';
    paymentStatus?: 'pending' | 'partial' | 'paid';
    notes?: string;
    attachment?: string; // URL/Path to invoice image
    createdBy?: string; // ObjectId of the user who created it
    createdAt?: Date;
    updatedAt?: Date;
}
