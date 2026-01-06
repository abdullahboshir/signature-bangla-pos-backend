import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";
import httpStatus from "http-status";
import type { Request, Response } from "express";
import { VotingService } from "./voting.service.ts";

const createProposal = catchAsync(async (req: Request, res: Response) => {
    const result = await VotingService.createProposal({
        ...req.body,
        createdBy: req.user?.['_id']
    });
    ApiResponse.success(res, result, "Proposal created successfully", httpStatus.CREATED);
});

const getAllProposals = catchAsync(async (req: Request, res: Response) => {
    const result = await VotingService.getAllProposals(req.query);
    ApiResponse.success(res, result, "Proposals retrieved successfully");
});

const castVote = catchAsync(async (req: Request, res: Response) => {
    // Body: { shareholderId: string, option: string, comments?: string }
    const result = await VotingService.castVote(
        req.params['id'] as string,
        req.body.shareholderId,
        req.body.option,
        req.body.comments
    );
    ApiResponse.success(res, result, "Vote cast successfully");
});

const updateStatus = catchAsync(async (req: Request, res: Response) => {
    const result = await VotingService.updateProposalStatus(req.params['id'] as string, req.body.status);
    ApiResponse.success(res, result, "Proposal status updated");
});

export const VotingController = {
    createProposal,
    getAllProposals,
    castVote,
    updateStatus
};
