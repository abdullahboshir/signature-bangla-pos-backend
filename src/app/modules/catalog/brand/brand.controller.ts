import { GenericController } from "@core/controllers/GenericController.ts";
import { BrandService } from "./brand.service.ts";

const brandServiceMap = {
    create: BrandService.createBrand,
    getAll: BrandService.getAllBrands,
    getById: BrandService.getBrandById,
    update: BrandService.updateBrand,
    delete: BrandService.deleteBrand
};

export const BrandController = new GenericController(brandServiceMap, "Brand");
