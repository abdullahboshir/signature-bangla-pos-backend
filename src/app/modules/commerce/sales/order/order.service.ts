import { startSession } from "mongoose";
import AppError from '../../../../../shared/errors/app-error.js';
import { OrderRepository } from "./order.repository.js";
import type { IOrder } from "./order.interface.js";
import { Stock as _Stock } from '@app/modules/erp/inventory/stock/stock.model.ts';
import { Customer } from "../../../contacts/customers/customer.model.js";
import { Outlet } from "../../../platform/organization/outlet/outlet.model.js";
import { ContextService } from "../../../../../core/services/context.service.js";

import { CatalogProductAdapter } from "@app/modules/catalog/index.ts";
import { inventoryAdapter } from "@app/modules/erp/index.ts";

const orderRepository = new OrderRepository();

const generateOrderId = async () => {
    const count = await orderRepository.count({});
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');

    return `ORD-${year}${month}-${(count + 1).toString().padStart(4, '0')}`;
};

export const createOrderService = async (payload: IOrder) => {
    const session = await startSession();
    session.startTransaction();

    try {
        // 0. Referential Integrity Check
        if (payload.customer) {
            await ContextService.validateReferentialIntegrity(Customer, payload.customer);
        }
        if (payload.outlet) {
            await ContextService.validateReferentialIntegrity(Outlet, payload.outlet);
        }

        const outletId = payload.outlet.toString();

        // 1. Generate Order ID
        payload.orderId = await generateOrderId();

        // 2. Validate Items & Check/Reserve Stock
        for (const item of payload.items) {
            const productId = item.product.toString();
            
            // a. Get Product Info (External through Adapter)
            const product = await CatalogProductAdapter.getProductById(productId);
            if (!product) {
                throw new AppError(404, `Product not found: ${productId}`);
            }

            // b. Check & Reserve Stock (External through ERP Adapter)
            const isAvailable = await inventoryAdapter.checkAvailability(productId, outletId, item.quantity);
            if (!isAvailable) {
                throw new AppError(400, `Insufficient stock for product: ${product.name} at the selected outlet.`);
            }

            const reserved = await inventoryAdapter.reserveStock(productId, outletId, item.quantity, session);
            if (!reserved) {
                throw new AppError(400, `Failed to reserve stock for product: ${product.name}`);
            }
        }

        // 3. Create Order
        payload.dueAmount = payload.totalAmount - (payload.paidAmount || 0);

        if (payload.paidAmount >= payload.totalAmount) {
            payload.paymentStatus = "paid";
        } else if (payload.paidAmount > 0) {
            payload.paymentStatus = "partial";
        } else {
            payload.paymentStatus = "pending";
        }

        const order = await orderRepository.create(payload, session);

        await session.commitTransaction();
        session.endSession();
        return order;

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

import { Order } from "./order.model.js";
import { QueryBuilder } from "../../../../../core/database/QueryBuilder.js";

// ...

export const getAllOrdersService = async (query: any) => {
    // 1. Build Query (Automatic Context Isolation via contextScopePlugin)
    const orderQuery = new QueryBuilder(
        Order.find()
            .populate("customer")
            .populate("outlet")
            .populate("businessUnit"),
        query
    )
        .search(['orderId', 'customer.name', 'paymentMethod']) // Searchable fields (customer.name might not work if not via aggregate, but kept for now. OrderId is main)
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await orderQuery.modelQuery;
    const meta = await orderQuery.countTotal();

    return {
        meta,
        result
    };
};

export const getOrderByIdService = async (id: string) => {
    return await orderRepository.findById(id);
};

export const updateOrderStatusService = async (id: string, status: string) => {
    const order = await orderRepository.findById(id);
    if (!order) throw new AppError(404, "Order not found");

    order.status = status as any;
    await order.save();
    return order;
};
