import { Proposal, type IProposal } from "./proposal.model.ts";
import AppError from "@shared/errors/app-error.ts";
import httpStatus from "http-status";
import { Types } from "mongoose";

const createProposal = async (payload: Partial<IProposal>) => {
    const result = await Proposal.create(payload);
    return result;
};

const getAllProposals = async (filters: any) => {
    const query: any = {};
    if (filters.businessUnit) query.businessUnit = filters.businessUnit;
    if (filters.status) query.status = filters.status;

    const result = await Proposal.find(query)
        .populate('createdBy', 'name')
        .sort({ startDate: -1 });
    return result;
};

const castVote = async (proposalId: string, shareholderId: string, optionValue: string, comments?: string) => {
    const proposal = await Proposal.findById(proposalId);
    if (!proposal) throw new AppError(httpStatus.NOT_FOUND, "Proposal not found");

    if (proposal.status !== 'active') throw new AppError(httpStatus.BAD_REQUEST, "Voting is not active for this proposal");

    // Check if already voted
    const existingVoteIndex = proposal.votes.findIndex(v => v.shareholder.toString() === shareholderId);
    if (existingVoteIndex > -1) {
        throw new AppError(httpStatus.BAD_REQUEST, "Shareholder has already voted");
    }

    proposal.votes.push({
        shareholder: shareholderId as any,
        optionValue,
        timestamp: new Date(),
        comments: comments || ""
    });

    await proposal.save();
    return proposal;
};

const updateProposalStatus = async (id: string, status: IProposal['status']) => {
    const result = await Proposal.findByIdAndUpdate(id, { status }, { new: true });
    return result;
};

export const VotingService = {
    createProposal,
    getAllProposals,
    castVote,
    updateProposalStatus
};
