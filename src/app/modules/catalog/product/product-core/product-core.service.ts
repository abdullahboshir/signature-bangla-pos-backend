
import AppError from "@shared/errors/app-error.ts";
import { Category } from "../../category/category.model.js";
import type { IProductCore } from "./product-core.interface.js";

import { Product } from "./product-core.model.js";
import { generateProductCode } from "./product-core.utils.js";



export const createProductService = async (payload: IProductCore) => {
  const category = await Category.findOne({ _id: payload?.categories })
  
  
  if (!category) {
    new AppError(200, 'The User already has registered!')
  }


  const productSku = await generateProductCode(category?.name? category?.name : 'others', payload?.origine);

  payload.sku = productSku;

  const result = await Product.create(payload);
  return result;
}
