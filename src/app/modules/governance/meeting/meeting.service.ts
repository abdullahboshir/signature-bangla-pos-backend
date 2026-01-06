import { Meeting, type IMeeting } from "./meeting.model.ts";
import AppError from "@shared/errors/app-error.ts";
import httpStatus from "http-status";

const createMeeting = async (payload: Partial<IMeeting>) => {
    const result = await Meeting.create(payload);
    return result;
};

const getAllMeetings = async (filters: any) => {
    const query: any = {};
    if (filters.businessUnit) query.businessUnit = filters.businessUnit;

    const result = await Meeting.find(query)
        .sort({ date: -1 });
    return result;
};

const updateMeeting = async (id: string, payload: Partial<IMeeting>) => {
    const result = await Meeting.findByIdAndUpdate(id, payload, { new: true });
    if (!result) throw new AppError(httpStatus.NOT_FOUND, "Meeting not found");
    return result;
};

export const MeetingService = {
    createMeeting,
    getAllMeetings,
    updateMeeting
};
