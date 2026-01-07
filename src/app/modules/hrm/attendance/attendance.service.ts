import { BusinessUnit } from "@app/modules/platform/index.js";
import { Attendance } from "./attendance.model.ts";
import type { IAttendance } from "./attendance.model.ts";
import AppError from "@shared/errors/app-error.ts";
import httpStatus from "http-status";
import { Types } from "mongoose";


const checkIn = async (userId: string, payload: Partial<IAttendance>) => {
    // Resolve Business Unit Slug
    if (payload.businessUnit) {
        const isObjectId = Types.ObjectId.isValid(payload.businessUnit.toString());
        if (!isObjectId) {
            const bu = await BusinessUnit.findOne({ slug: payload.businessUnit });
            if (bu) payload.businessUnit = bu._id;
        }
    }

    // 1. Check if already checked in today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existingAttendance = await Attendance.findOne({
        staff: userId,
        date: {
            $gte: startOfDay,
            $lte: endOfDay
        }
    });

    if (existingAttendance) {
        throw new AppError(httpStatus.BAD_REQUEST, "Already checked in today");
    }

    // 2. Create Attendance
    const attendance = await Attendance.create({
        ...payload,
        staff: userId,
        date: startOfDay, // Normalize date
        checkIn: new Date(),
        status: 'present' // Default
    });

    return attendance;
};

const getAllAttendance = async (filters: any) => {
    // Basic filter implementation
    const query: any = {};
    if (filters.staff) query.staff = filters.staff;
    if (filters.date) query.date = new Date(filters.date);
    if (filters.status) query.status = filters.status;
    if (filters.businessUnit) query.businessUnit = filters.businessUnit;

    const result = await Attendance.find(query).populate('staff', 'name email').sort({ createdAt: -1 });
    return result;
};

const getAttendanceById = async (id: string) => {
    const result = await Attendance.findById(id).populate('staff', 'name email');
    if (!result) throw new AppError(httpStatus.NOT_FOUND, "Attendance record not found");
    return result;
};

const updateAttendance = async (id: string, payload: Partial<IAttendance>) => {
    // If payload has checkOut, set it
    if (payload.checkOut) {
        payload.checkOut = new Date(); // Ensure server time
    }

    const result = await Attendance.findByIdAndUpdate(id, payload, { new: true });
    if (!result) throw new AppError(httpStatus.NOT_FOUND, "Attendance record not found");
    return result;
};

const deleteAttendance = async (id: string) => {
    const result = await Attendance.findByIdAndDelete(id);
    if (!result) throw new AppError(httpStatus.NOT_FOUND, "Attendance record not found");
    return result;
};

export const AttendanceService = {
    checkIn,
    getAllAttendance,
    getAttendanceById,
    updateAttendance,
    deleteAttendance
};
