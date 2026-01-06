import { ComplianceDocument, type IComplianceDocument } from "./compliance.model.ts";
import AppError from "@shared/errors/app-error.ts";
import httpStatus from "http-status";

const uploadDocument = async (payload: Partial<IComplianceDocument>) => {
    const result = await ComplianceDocument.create(payload);
    return result;
};

const getAllDocuments = async (filters: any) => {
    const query: any = {};
    if (filters.businessUnit) query.businessUnit = filters.businessUnit;
    if (filters.type) query.type = filters.type;

    const result = await ComplianceDocument.find(query)
        .sort({ createdAt: -1 });
    return result;
};

const deleteDocument = async (id: string) => {
    const result = await ComplianceDocument.findByIdAndDelete(id);
    if (!result) throw new AppError(httpStatus.NOT_FOUND, "Document not found");
    return result;
};

export const ComplianceService = {
    uploadDocument,
    getAllDocuments,
    deleteDocument
};
