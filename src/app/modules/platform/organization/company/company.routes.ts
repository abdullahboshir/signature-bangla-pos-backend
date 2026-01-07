import express from 'express';
import * as CompanyController from './company.controller.js';
// import validateRequest from '@app/middleware/validateRequest'; // Assuming this exists or will be created
// import { createCompanySchema } from './company.validation';

import { CompanySettingsRoutes } from './settings/settings.routes.js';

const router = express.Router();

router.use('/:companyId/settings', CompanySettingsRoutes); // Nested Settings Route

router.post('/', CompanyController.createCompany); // Add validateRequest(createCompanySchema)
router.get('/', CompanyController.getAllCompanies);
router.get('/:id', CompanyController.getCompanyById);

export const CompanyRoutes = router;
