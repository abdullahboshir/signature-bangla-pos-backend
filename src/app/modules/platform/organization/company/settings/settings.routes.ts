import { Router } from 'express';
import { CompanySettingsController } from './settings.controller.ts';

const router = Router({ mergeParams: true }); // Allow access to :companyId from parent router

router.get('/', CompanySettingsController.getSettings);
router.patch('/', CompanySettingsController.updateSettings);

export const CompanySettingsRoutes = router;
