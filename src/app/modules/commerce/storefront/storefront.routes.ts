import { Router } from 'express';
import { USER_ROLE } from '@app/modules/iam/user/user.constant.ts';
import auth from '@core/middleware/auth.ts';
import {
    getStoreConfigController,
    updateStoreConfigController,
    getPageController,
    savePageController,
    getAllPagesController,
    deletePageController,
    getStoreProductsController
} from './storefront.controller.ts';

const router = Router();

// ============================================================================
// PUBLIC ROUTES (For the Public Storefront Website)
// ============================================================================
// No auth required
router.get('/:businessUnitId/products', getStoreProductsController);
router.get('/:businessUnitId/config', getStoreConfigController);
router.get('/:businessUnitId/pages/:slug', getPageController);

// ============================================================================
// ADMIN ROUTES (For the Builder UI)
// ============================================================================
// Required Auth
router.patch(
    '/:businessUnitId/config',
    auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.MANAGER),
    updateStoreConfigController
);

router.post(
    '/:businessUnitId/pages',
    auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.MANAGER),
    savePageController
);

router.get(
    '/:businessUnitId/pages',
    auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.MANAGER),
    getAllPagesController
);

router.delete(
    '/:businessUnitId/pages/:pageId',
    auth(USER_ROLE.SUPER_ADMIN, USER_ROLE.ADMIN, USER_ROLE.MANAGER),
    deletePageController
);

export const storefrontRoutes = router;
