import { Router } from 'express';
import { OrganizationSettingsController } from './settings.controller.js';

const router = Router({ mergeParams: true }); // Allow access to :organizationId from parent router

router.get('/', OrganizationSettingsController.getSettings);
router.patch('/', OrganizationSettingsController.updateSettings);

export const OrganizationSettingsRoutes = router;
