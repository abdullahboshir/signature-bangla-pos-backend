import { Courier, type ICourier } from "./courier.model.ts";
import { QueryBuilder } from "@core/database/QueryBuilder.ts";
import { resolveBusinessUnitQuery } from "@core/utils/query-helper.ts";
import { resolveBusinessUnitId } from "@core/utils/mutation-helper.ts";
import AppError from "@shared/errors/app-error.ts";
import httpStatus from "http-status";
// import axios from "axios"; // Will use for actual integration

// ==================== COURIER CONFIG FUNCTIONS ====================

const createCourier = async (data: ICourier, user: any) => {
    const businessUnitId = await resolveBusinessUnitId((data.businessUnit || user.businessUnit) as any);
    const courier = await Courier.create([{ ...data, businessUnit: businessUnitId as any }]);
    return courier[0];
};

const getAllCouriers = async (query: Record<string, unknown>, user: any) => {
    const businessUnitQuery = await resolveBusinessUnitQuery(user);
    const courierQuery = new QueryBuilder(Courier.find(businessUnitQuery), query)
        .search(["name", "providerId"])
        .filter()
        .sort()
        .paginate()
        .fields();

    const meta = await courierQuery.countTotal();
    const result = await courierQuery.modelQuery;

    return { meta, result };
};

const getCourierById = async (id: string, user: any) => {
    const businessUnitQuery = await resolveBusinessUnitQuery(user);
    const courier = await Courier.findOne({ _id: id, ...businessUnitQuery }).select('+apiKey +apiSecret');
    if (!courier) throw new AppError(httpStatus.NOT_FOUND, "Courier not found");
    return courier;
};

const updateCourier = async (id: string, payload: Partial<ICourier>, user: any) => {
    const businessUnitQuery = await resolveBusinessUnitQuery(user);
    const courier = await Courier.findOneAndUpdate({ _id: id, ...businessUnitQuery }, payload, {
        new: true,
        runValidators: true,
    });
    if (!courier) throw new AppError(httpStatus.NOT_FOUND, "Courier not found");
    return courier;
};

const deleteCourier = async (id: string, user: any) => {
    const businessUnitQuery = await resolveBusinessUnitQuery(user);
    const courier = await Courier.findOneAndDelete({ _id: id, ...businessUnitQuery });
    if (!courier) throw new AppError(httpStatus.NOT_FOUND, "Courier not found");
    return courier;
};

// ==================== SHIPMENT FUNCTIONS (Placeholder) ====================

const createShipment = async (_orderId: string, courierId: string, user: any) => {
    // 1. Get Courier Config
    const courier = await getCourierById(courierId, user);
    if (!courier || !courier.isActive) throw new AppError(httpStatus.BAD_REQUEST, "Courier not active");

    // 2. Fetch Order Data (Not implemented here, would need Order Model)
    // const order = await Order.findById(orderId);

    // 3. Call External API (Steadfast/Pathao)
    // const response = await axios.post(`${courier.baseUrl}/create_order`, { ... });

    return {
        trackingCode: "TRACK-123456", // Mock
        courier: courier.name,
        status: "placed"
    };
};

export const LogisticsService = {
    createCourier,
    getAllCouriers,
    getCourierById,
    updateCourier,
    deleteCourier,
    createShipment
};
