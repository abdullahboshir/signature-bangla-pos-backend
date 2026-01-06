import express from 'express';
import { SystemSettingsController } from './system-settings.controller.js';
import auth from '@core/middleware/auth.ts';
import { USER_ROLE } from '@app/modules/iam/user/user.constant.ts';

const router = express.Router();

// Only Super Admin should be able to manage system settings
router.get(
    '/',
    auth(),
    SystemSettingsController.getSystemSettings
);

router.patch(
    '/',
    auth(USER_ROLE.SUPER_ADMIN),
    SystemSettingsController.updateSystemSettings
);

export const SystemSettingsRoutes = router;
