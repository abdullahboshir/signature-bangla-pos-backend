import { Router } from "express";
import { TaxController } from "./tax.controller.ts";
import { validateRequest } from "@core/middleware/validateRequest.ts";
import { TaxValidations } from "./tax.validation.ts";
import auth from "@core/middleware/auth.ts";
import { USER_ROLE } from "@app/modules/iam/index.js";
import type { AnyZodObject } from "zod/v3";

import { resolveBusinessUnit } from "@core/middleware/resolveBusinessUnit.ts";

const router = Router();

router.post(
    '/',
    auth(USER_ROLE.SUPER_ADMIN),
    validateRequest(TaxValidations.createTaxValidationSchema as unknown as AnyZodObject),
    resolveBusinessUnit,
    TaxController.createTax
);

router.get('/', auth(USER_ROLE.SUPER_ADMIN), resolveBusinessUnit, TaxController.getAllTaxes);

router.get('/:id', auth(USER_ROLE.SUPER_ADMIN), TaxController.getTaxById);

router.patch(
    '/:id',
    auth(USER_ROLE.SUPER_ADMIN),
    validateRequest(TaxValidations.updateTaxValidationSchema as unknown as AnyZodObject),
    TaxController.updateTax
);

router.delete('/:id', auth(USER_ROLE.SUPER_ADMIN), TaxController.deleteTax);

export const TaxRoutes = router;
