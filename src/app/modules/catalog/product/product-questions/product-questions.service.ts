import type { IProductQA } from "./product-questions.interface.ts";
import { ProductQA } from "./product-questions.model.js";

import { Types } from "mongoose";

const createQuestion = async (payload: IProductQA) => {
    const result = await ProductQA.create(payload);
    return result;
};

const getQuestionsForProduct = async (productId: string, query: Record<string, unknown>) => {
    const { page = 1, limit = 10 } = query;
    const skip = (Number(page) - 1) * Number(limit);

    const result = await ProductQA.find({ product: productId, isPublic: true })
        .populate('user', 'name')
        .populate('product', 'name')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

    const total = await ProductQA.countDocuments({ product: productId, isPublic: true });

    return {
        meta: { page: Number(page), limit: Number(limit), total },
        data: result
    };
};

const getAllQuestions = async (query: Record<string, unknown>) => {
    const page = Number(query['page'] || 1);
    const limit = Number(query['limit'] || 10);
    const searchTerm = query['searchTerm'] as string;
    const status = query['status'];

    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = {};

    if (searchTerm) {
        filter['question'] = { $regex: searchTerm, $options: 'i' };
    }
    if (status) {
        filter['status'] = status;
    }

    const result = await ProductQA.find(filter)
        .populate('user', 'name email')
        .populate('product', 'name')
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

    const total = await ProductQA.countDocuments(filter);

    return {
        meta: { page: Number(page), limit: Number(limit), total },
        data: result
    };
};

const answerQuestion = async (id: string, answer: string, userId: string) => {
    const result = await ProductQA.findByIdAndUpdate(
        id,
        {
            answer,
            isAnswered: true,
            answeredBy: userId,
            status: 'approved', // Auto approve when answered by admin
            isPublic: true // Auto publish when answered
        },
        { new: true }
    );
    return result;
};

const updateQuestionStatus = async (id: string, status?: string, isPublic?: boolean) => {
    const updateData: any = {};
    if (status) updateData.status = status;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const result = await ProductQA.findByIdAndUpdate(id, updateData, { new: true });
    return result;
};

const deleteQuestion = async (id: string) => {
    const result = await ProductQA.findByIdAndDelete(id);
    return result;
};

export const ProductQAService = {
    createQuestion,
    getQuestionsForProduct,
    getAllQuestions,
    answerQuestion,
    updateQuestionStatus,
    deleteQuestion,
};
