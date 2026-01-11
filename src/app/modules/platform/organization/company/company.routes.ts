import express from 'express';
import * as CompanyController from './company.controller.js';
import { validateRequest } from '@core/middleware/validateRequest.ts';
import { createCompanySchema } from './company.validation.js';

import { CompanySettingsRoutes } from './settings/settings.routes.js';
import auth from '@core/middleware/auth.ts';

const router = express.Router();

router.use('/:companyId/settings', CompanySettingsRoutes); // Nested Settings Route

router.post('/', auth('super-admin'), validateRequest(createCompanySchema), CompanyController.createCompany);
router.get('/', auth(), CompanyController.getAllCompanies);
router.get('/:id', auth(), CompanyController.getCompanyById);

export const CompanyRoutes = router;
