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
    status: 'pending' | 'ordered' | 'received';
    items: IPurchaseItem[];
    subTotal: number;
    tax?: number;
    shippingCost?: number;
    discount?: number;
    grandTotal: number;
    notes?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
