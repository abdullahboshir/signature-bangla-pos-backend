import express from 'express';
import { AttributeGroupController } from './attribute-group.controller.ts';
import auth from '@core/middleware/auth.ts';
import { USER_ROLE } from '@app/modules/iam/user/user.constant.ts';
import { validateRequest } from '@core/middleware/validateRequest.ts';
import { AttributeGroupValidations } from './attribute-group.validation.ts';
import type { AnyZodObject } from 'zod/v3';

const router = express.Router();

router.post(
    '/',
    auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.COMPANY_OWNER, USER_ROLE.ADMIN),
    validateRequest(AttributeGroupValidations.createAttributeGroupValidationSchema as unknown as AnyZodObject),
    AttributeGroupController.createAttributeGroup
);

router.get(
    '/',
    auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.COMPANY_OWNER, USER_ROLE.ADMIN, USER_ROLE.MANAGER),
    AttributeGroupController.getAllAttributeGroups
);

router.get(
    '/:id',
    auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.COMPANY_OWNER, USER_ROLE.ADMIN, USER_ROLE.MANAGER),
    AttributeGroupController.getAttributeGroupById
);

router.patch(
    '/:id',
    auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.COMPANY_OWNER, USER_ROLE.ADMIN),
    validateRequest(AttributeGroupValidations.updateAttributeGroupValidationSchema as unknown as AnyZodObject),
    AttributeGroupController.updateAttributeGroup
);

router.delete(
    '/:id',
    auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.COMPANY_OWNER, USER_ROLE.ADMIN),
    AttributeGroupController.deleteAttributeGroup
);

export const AttributeGroupRoutes = router;
