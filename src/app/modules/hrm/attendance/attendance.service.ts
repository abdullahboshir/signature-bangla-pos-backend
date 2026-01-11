import { QueryBuilder } from "@core/database/QueryBuilder.ts";
import { resolveBusinessUnitId } from "@core/utils/mutation-helper.ts";
import { Attendance } from "./attendance.model.ts";
import type { IAttendance } from "./attendance.model.ts";
import AppError from "@shared/errors/app-error.ts";
import httpStatus from "http-status";

const checkIn = async (userId: string, payload: any, user?: any) => {
    // 🛡️ Resolve Business Unit ID SECURELY with ownership verification
    if (payload.businessUnit) {
        payload.businessUnit = await resolveBusinessUnitId(payload.businessUnit, user);
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
    const attendanceQuery = new QueryBuilder(
        Attendance.find().populate('staff', 'name email'),
        filters
    )
        .filter()
        .sort()
        .paginate();

    const result = await attendanceQuery.modelQuery;
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
