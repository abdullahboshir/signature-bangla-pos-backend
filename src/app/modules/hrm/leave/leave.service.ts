import { Leave, type ILeave } from "./leave.model.ts";
import AppError from "@shared/errors/app-error.ts";
import httpStatus from "http-status";
import { Types } from "mongoose";
import { BusinessUnit } from "@app/modules/platform/index.js";


const createLeave = async (userId: string, payload: Partial<ILeave>) => {
    // Resolve Business Unit Slug
    if (payload.businessUnit) {
        const isObjectId = Types.ObjectId.isValid(payload.businessUnit.toString());
        if (!isObjectId) {
            const bu = await BusinessUnit.findOne({ slug: payload.businessUnit });
            if (bu) payload.businessUnit = bu._id;
        }
    }

    if (payload.startDate && payload.endDate) {
        // Calculate days difference (simple version, not accounting for holidays/weekends yet)
        const start = new Date(payload.startDate);
        const end = new Date(payload.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        payload.days = diffDays;
    }

    const leave = await Leave.create({
        ...payload,
        staff: userId,
        status: 'pending'
    });
    return leave;
};

const getAllLeave = async (filters: any) => {
    const query: any = {};
    if (filters.staff) query.staff = filters.staff;
    if (filters.status) query.status = filters.status;
    if (filters.businessUnit) query.businessUnit = filters.businessUnit;

    const result = await Leave.find(query)
        .populate('staff', 'name email')
        .populate('leaveType', 'name code')
        .sort({ createdAt: -1 });
    return result;
};

const updateLeaveStatus = async (id: string, status: 'approved' | 'rejected', approverId: string, reason?: string) => {
    const updateData: any = { status, approvedBy: approverId };
    if (status === 'rejected' && reason) updateData.rejectionReason = reason;

    const result = await Leave.findByIdAndUpdate(id, updateData, { new: true });
    if (!result) throw new AppError(httpStatus.NOT_FOUND, "Leave request not found");
    return result;
};

const deleteLeave = async (id: string) => {
    const result = await Leave.findByIdAndDelete(id);
    if (!result) throw new AppError(httpStatus.NOT_FOUND, "Leave request not found");
    return result;
};

export const LeaveService = {
    createLeave,
    getAllLeave,
    updateLeaveStatus,
    deleteLeave
};
