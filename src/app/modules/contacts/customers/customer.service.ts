import type { ICustomer } from "./customer.interface.js";
import Customer from "./customer.model.js";


// Basic getAll implementation
export const getAllCustomersService = async () => {
    const result = await Customer.find().sort({ createdAt: -1 });
    return result;
}

export const createCustomerService = async (payload: ICustomer) => {
    const result = await Customer.create(payload);
    return result;
} 