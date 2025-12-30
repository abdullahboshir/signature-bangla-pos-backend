import { Expense } from "./expense.model.js";

import { QueryBuilder } from "@core/database/QueryBuilder.js";
import { resolveBusinessUnitQuery } from "@core/utils/query-helper.js";
import { resolveBusinessUnitId } from "@core/utils/mutation-helper.js";
import { Types as _Types } from "mongoose";
import type { IExpense } from "./expense.interface.ts";

const generateExpenseId = async () => {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');

    // Find last expense created this month to increment
    const lastExpense = await Expense.findOne({
        expenseId: new RegExp(`^EXP-${year}${month}-`)
    }).sort({ createdAt: -1 });

    let sequence = '0001';
    if (lastExpense && lastExpense.expenseId) {
        const parts = lastExpense.expenseId.split('-');
        if (parts.length === 3) {
            const lastSeq = parseInt(parts[2] as string);
            sequence = (lastSeq + 1).toString().padStart(4, '0');
        }
    }

    return `EXP-${year}${month}-${sequence}`;
};

const createExpense = async (payload: IExpense) => {
    // 1. Generate ID
    payload.expenseId = await generateExpenseId();

    // 2. Resolve Business Unit
    if (payload.businessUnit) {
        const resolvedId = await resolveBusinessUnitId(payload.businessUnit);
        if (resolvedId) {
            payload.businessUnit = resolvedId;
        }
    }

    const result = await Expense.create(payload);
    return result;
};

const getAllExpenses = async (query: Record<string, unknown>) => {
    const finalQuery = await resolveBusinessUnitQuery(query);

    const expenseQuery = new QueryBuilder(
        Expense.find()
            .populate("category", "name type")
            .populate("businessUnit", "name")
            .populate("outlet", "name")
            .populate("createdBy", "name"),
        finalQuery
    )
        .search(["reference", "remarks", "expenseId"])
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await expenseQuery.modelQuery;
    const meta = await expenseQuery.countTotal();

    return {
        meta,
        result,
    };
};

const getExpenseById = async (id: string) => {
    const result = await Expense.findById(id)
        .populate("category")
        .populate("businessUnit")
        .populate("outlet")
        .populate("createdBy");
    return result;
};

const updateExpense = async (id: string, payload: Partial<IExpense>) => {
    const result = await Expense.findByIdAndUpdate(id, payload, {
        new: true,
    });
    return result;
};

const deleteExpense = async (id: string) => {
    const result = await Expense.findByIdAndDelete(id);
    return result;
};

const getExpenseStats = async (_query: Record<string, unknown>) => {
    // Implement stats logic later (e.g., grouping by category)
    // For now returning basic aggregation placeholder
    return {};
};

export const ExpenseService = {
    createExpense,
    getAllExpenses,
    getExpenseById,
    updateExpense,
    deleteExpense,
    getExpenseStats
};
