import { Router } from "express";

import { productZodSchema, productUpdateSchema } from "./product-core-validation.js";
import { createProductController, getAllProductsController, getProductByIdController, updateProductController, deleteProductController } from "./product-core-controller.js";
import auth from "@core/middleware/auth.ts";
import { USER_ROLE } from "@app/modules/iam/index.js";
import { PermissionActionObj, PermissionSourceObj } from "@app/modules/iam/index.js";
import { authorize } from "@core/middleware/authorize.ts";
import { validateRequest } from "@core/middleware/validateRequest.ts";
import moduleGuard from "@app/middlewares/moduleGuard.ts";




const router = Router();

// Apply Module Guard for all Product Operations (ERP Module)
router.use(moduleGuard('erp'));


router.post('/create', auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
  authorize(PermissionSourceObj.customer, PermissionActionObj.create),
  validateRequest(productZodSchema), createProductController)

router.get('/',
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.VENDOR), // Optional: Adjust roles as needed
  getAllProductsController
);

router.get('/:id',
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.VENDOR),
  getProductByIdController
);

router.patch('/:id',
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
  // authorize(PermissionSourceObj.customer, PermissionActionObj.update), // Add detailed auth later
  validateRequest(productUpdateSchema),
  updateProductController
);

router.delete('/:id',
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
  // authorize(PermissionSourceObj.customer, PermissionActionObj.delete), // Add detailed auth later
  deleteProductController
);



export const productRoutes = router;