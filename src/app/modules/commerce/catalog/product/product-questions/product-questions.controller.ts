import type { Request, Response } from 'express';
import catchAsync from '../../../../../../core/utils/catchAsync.js';
import { ApiResponse } from '../../../../../../core/utils/api-response.js';
import httpStatus from 'http-status'; // Added import for httpStatus
import { ProductQAService } from './product-questions.service.js';

const createQuestion = catchAsync(async (req: Request, res: Response) => {
    // @ts-ignore
    const user = req.user.userId;
    const result = await ProductQAService.createQuestion({ ...req.body, user });

    ApiResponse.success(res, result, "Question created successfully", httpStatus.CREATED);
});

const getQuestionsForProduct = catchAsync(async (req: Request, res: Response) => {
    const result = await ProductQAService.getQuestionsForProduct(req.params['productId'] as string, req.query);

    ApiResponse.success(
        res,
        result,
        "Questions retrieval successfully"
    );
});

const getQuestions = catchAsync(async (req: Request, res: Response) => {
    const result = await ProductQAService.getAllQuestions(req.query);

    ApiResponse.success(res, result, "Questions retrieved successfully");
});

const updateQuestion = catchAsync(async (req: Request, res: Response) => {
    // @ts-ignore
    const result = await ProductQAService.answerQuestion(req.params['id'] as string, req.body.answer, req.user.userId);

    ApiResponse.success(
        res,
        result,
        "Question answered successfully"
    );
});

const updateStatus = catchAsync(async (req: Request, res: Response) => {
    const result = await ProductQAService.updateQuestionStatus(req.params['id'] as string, req.body.status, req.body.isPublic);

    ApiResponse.success(
        res,
        result,
        "Question status updated successfully"
    );
});

const deleteQuestion = catchAsync(async (req: Request, res: Response) => {
    const result = await ProductQAService.deleteQuestion(req.params['id'] as string);

    ApiResponse.success(res, result, "Question deleted successfully");
});

export const ProductQAController = {
    createQuestion,
    getQuestionsForProduct,
    getQuestions,
    updateQuestion,
    updateStatus,
    deleteQuestion,
};
