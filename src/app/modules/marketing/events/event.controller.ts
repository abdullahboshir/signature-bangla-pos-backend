import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import httpStatus from "http-status";
import type { Request, Response } from "express";

const createEvent = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Event created successfully", httpStatus.CREATED);
});

const getAllEvent = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.paginated(res, [], 1, 10, 0, "Events retrieved successfully");
});

const getEventById = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Event retrieved successfully");
});

const updateEvent = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Event updated successfully");
});

const deleteEvent = catchAsync(async (_req: Request, res: Response) => {
    ApiResponse.success(res, null, "Event deleted successfully");
});

export const EventController = {
    createEvent,
    getAllEvent,
    getEventById,
    updateEvent,
    deleteEvent,
};
