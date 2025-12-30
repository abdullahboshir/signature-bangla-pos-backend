
export interface ISupplier {
    id: string;
    name: string;
    contactPerson?: string;
    email?: string;
    phone?: string;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        zipCode?: string;
    };
    taxId?: string;
    status: 'active' | 'inactive';
    businessUnits: string[]; // ObjectIds
    createdAt?: Date;
    updatedAt?: Date;
}
