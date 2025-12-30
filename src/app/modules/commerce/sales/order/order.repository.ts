import { BaseRepository } from '../../../../../core/database/mongoose/repositories/base-repository.js';
import type { IOrder } from "./order.interface.js";

import { Order } from "./order.model.js";

export class OrderRepository extends BaseRepository<IOrder> {
    constructor() {
        super(Order);
    }

    async findByOrderId(orderId: string): Promise<IOrder | null> {
        return this.model.findOne({ orderId }).populate('items.product').populate('customer');
    }

    async findByBusinessUnit(businessUnitId: string, query: any = {}): Promise<IOrder[]> {
        return this.model.find({ businessUnit: businessUnitId, ...query })
            .sort({ createdAt: -1 })
            .populate('items.product')
            .populate('customer');
    }

    override async findAll(filter: any = {}): Promise<IOrder[]> {
        return this.model.find(filter)
            .sort({ createdAt: -1 })
            .populate('items.product')
            .populate('customer');
    }
}
