import { ExpenseCategory } from "./expense-category.model.js";
import type { IExpenseCategory } from "./expense-category.interface.ts";
import { QueryBuilder } from "@core/database/QueryBuilder.js";
import { resolveBusinessUnitQuery } from "@core/utils/query-helper.js";
import { resolveBusinessUnitId } from "@core/utils/mutation-helper.js";

const createExpenseCategory = async (payload: IExpenseCategory) => {
    if (payload.businessUnit) {
        const resolvedId = await resolveBusinessUnitId(payload.businessUnit);
        if (resolvedId) {
            payload.businessUnit = resolvedId;
        }
    }
    const result = await ExpenseCategory.create(payload);
    return result;
};

const getAllExpenseCategories = async (query: Record<string, unknown>) => {
    // Resolve BU for filtering
    const finalQuery = await resolveBusinessUnitQuery(query);

    const expenseCategoryQuery = new QueryBuilder(
        ExpenseCategory.find().populate("businessUnit", "name"),
        finalQuery
    )
        .search(["name", "type"])
        .filter()
        .sort()
        .paginate()
        .fields();

    const result = await expenseCategoryQuery.modelQuery;
    const meta = await expenseCategoryQuery.countTotal();

    return {
        meta,
        result,
    };
};

const getExpenseCategoryById = async (id: string) => {
    const result = await ExpenseCategory.findById(id).populate("businessUnit", "name");
    return result;
};

const updateExpenseCategory = async (id: string, payload: Partial<IExpenseCategory>) => {
    const result = await ExpenseCategory.findByIdAndUpdate(id, payload, {
        new: true,
    });
    return result;
};

const deleteExpenseCategory = async (id: string) => {
    const result = await ExpenseCategory.findByIdAndDelete(id);
    return result;
};

export const ExpenseCategoryService = {
    createExpenseCategory,
    getAllExpenseCategories,
    getExpenseCategoryById,
    updateExpenseCategory,
    deleteExpenseCategory,
};
