import type { ICustomer } from "./customer.interface.js";
import Customer from "./customer.model.js";


export const createCustomerService = async (payload: ICustomer) => {
const result = await Customer.create(payload);

return result; 
} 