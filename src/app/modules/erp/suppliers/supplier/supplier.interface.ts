
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
    module: 'pos' | 'erp' | 'hrm' | 'ecommerce' | 'crm' | 'logistics' | 'system';
    businessUnits: string[]; // ObjectIds
    businessUnit?: string;   // For Payload Convenience
    createdAt?: Date;
    updatedAt?: Date;
}
