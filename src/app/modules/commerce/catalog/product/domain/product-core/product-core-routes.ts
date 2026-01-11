import { Router } from "express";

import { productZodSchema, productUpdateSchema } from "./product-core-validation.js";
import { createProductController, getAllProductsController, getProductByIdController, updateProductController, deleteProductController } from "./product-core-controller.js";
import auth from "@core/middleware/auth.ts";
import { USER_ROLE } from "@app/modules/iam/index.js";
import { PermissionActionObj, PermissionSourceObj } from "@app/modules/iam/index.js";
import { authorize } from "@core/middleware/authorize.ts";
import { validateRequest } from "@core/middleware/validateRequest.ts";
import moduleGuard from "@app/middlewares/moduleGuard.ts";
import contextGuard from "@app/middlewares/contextGuard.ts";
import { resourceOwnerGuard } from "@app/middlewares/resourceOwnerGuard.ts";
import { Product } from "./product-core.model.js";




const router = Router();

// Apply Security Layer for all Product Operations (ERP Module with Context Awareness)
router.use(moduleGuard('erp'));
router.use(contextGuard());


router.post('/create', auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
  authorize(PermissionSourceObj.product, PermissionActionObj.create),
  validateRequest(productZodSchema), createProductController)

router.get('/',
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.VENDOR), // Optional: Adjust roles as needed
  getAllProductsController
);

router.get('/:id',
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.VENDOR),
  resourceOwnerGuard(Product),
  getProductByIdController
);

router.patch('/:id',
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
  authorize(PermissionSourceObj.product, PermissionActionObj.update),
  resourceOwnerGuard(Product),
  validateRequest(productUpdateSchema),
  updateProductController
);

router.delete('/:id',
  auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN),
  authorize(PermissionSourceObj.product, PermissionActionObj.delete),
  resourceOwnerGuard(Product),
  deleteProductController
);



export const productRoutes = router;