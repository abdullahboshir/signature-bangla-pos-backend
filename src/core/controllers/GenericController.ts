import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";

export class GenericController<T> {
    constructor(
        private service: {
            create: (data: any) => Promise<any>;
            getAll: (filters: any) => Promise<any>;
            getById: (id: string) => Promise<any>;
            update: (id: string, data: any) => Promise<any>;
            delete: (id: string) => Promise<any>;
            [key: string]: any; // Allow other methods
        },
        private entityName: string
    ) { }

    create = catchAsync(async (req: Request, res: Response) => {
        const result = await this.service.create(req.body);
        ApiResponse.success(
            res,
            result,
            `${this.entityName} created successfully`,
            httpStatus.CREATED
        );
    });

    getAll = catchAsync(async (req: Request, res: Response) => {
        const result = await this.service.getAll(req.query);

        // Check if result matches QueryBuilder output format { meta, result }
        if (result && result.meta && Array.isArray(result.result)) {
            ApiResponse.paginated(
                res,
                result.result,
                result.meta.page,
                result.meta.limit,
                result.meta.total,
                `${this.entityName}s retrieved successfully`,
                httpStatus.OK
            );
        } else {
            // Standard array response
            ApiResponse.success(
                res,
                result,
                `${this.entityName}s retrieved successfully`,
                httpStatus.OK
            );
        }
    });

    getById = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) throw new Error("ID parameter is required");
        const result = await this.service.getById(id);
        ApiResponse.success(
            res,
            result,
            `${this.entityName} retrieved successfully`,
            httpStatus.OK
        );
    });

    update = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) throw new Error("ID parameter is required");
        const result = await this.service.update(id, req.body);
        ApiResponse.success(
            res,
            result,
            `${this.entityName} updated successfully`,
            httpStatus.OK
        );
    });

    delete = catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        if (!id) throw new Error("ID parameter is required");
        const result = await this.service.delete(id);
        ApiResponse.success(
            res,
            result,
            `${this.entityName} deleted successfully`,
            httpStatus.OK
        );
    });
}
