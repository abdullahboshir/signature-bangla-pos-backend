import { startSession } from "mongoose";
import AppError from '../../../../../shared/errors/app-error.js';
import { OrderRepository } from "./order.repository.js";
import type { IOrder } from "./order.interface.js";
import { Product } from "../../catalog/product/product-core/product-core.model.js";
import { ProductInventory as _ProductInventory } from '../../catalog/product/product-inventory/product-inventory.model.js';

const orderRepository = new OrderRepository();

const generateOrderId = async () => {
    const count = await orderRepository.count({});
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');

    return `ORD - ${year}${month} -${(count + 1).toString().padStart(4, '0')} `;
};

export const createOrderService = async (payload: IOrder) => {
    const session = await startSession();
    session.startTransaction();

    try {
        // 1. Generate Order ID
        payload.orderId = await generateOrderId();

        // 2. Validate Items & Check Stock
        let calculatedTotal = 0;

        for (const item of payload.items) {
            const product = await Product.findById(item.product).populate('inventory');
            if (!product) {
                throw new AppError(404, `Product not found: ${item.product} `);
            }

            // Check Stock
            const inventoryDoc = product.inventory as any;

            if (!inventoryDoc) {
                throw new AppError(404, `Inventory not found / linked for product: ${product.name} `);
            }

            // Defensive check for nested inventory object
            if (!inventoryDoc.inventory) {
                throw new AppError(500, `Corrupted inventory data for product: ${product.name} (missing inventory structure)`);
            }

            const inventoryData = inventoryDoc.inventory;

            if (!payload.outlet) {
                throw new AppError(400, "Outlet ID is required for order creation");
            }
            const outletId = payload.outlet.toString();

            if (inventoryData.trackQuantity) {
                const canFulfill = inventoryDoc.canFulfillOrder(item.quantity, outletId);

                if (!canFulfill) {
                    throw new AppError(400, `Insufficient stock for product: ${product.name} at the selected outlet.`);
                }
            }

            // Update Stock
            if (inventoryData.trackQuantity) {
                // reserveStock handles global and outlet-specific reservation and validity check again
                const reserved = inventoryDoc.reserveStock(item.quantity, outletId);
                if (!reserved) {
                    throw new AppError(400, `Failed to reserve stock for product: ${product.name} `);
                }
                await inventoryDoc.save({ session });
            }

            calculatedTotal += item.total;
        }

        // 3. Create Order
        // Calculate due amount
        payload.dueAmount = payload.totalAmount - (payload.paidAmount || 0);

        // Set payment status
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
const { resolveBusinessUnitQuery } = await import('../../../../../core/utils/query-helper.js');

// ...

export const getAllOrdersService = async (query: any) => {
    // 1. Resolve Business Unit Logic
    const finalQuery = await resolveBusinessUnitQuery(query);

    // 2. Build Query
    const orderQuery = new QueryBuilder(
        Order.find()
            .populate("customer")
            .populate("outlet")
            .populate("businessUnit"),
        finalQuery
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
