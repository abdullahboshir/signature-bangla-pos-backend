import express from 'express';
import * as CompanyController from './company.controller';
// import validateRequest from '@app/middleware/validateRequest'; // Assuming this exists or will be created
// import { createCompanySchema } from './company.validation';

const router = express.Router();

router.post('/', CompanyController.createCompany); // Add validateRequest(createCompanySchema)
router.get('/', CompanyController.getAllCompanies);
router.get('/:id', CompanyController.getCompanyById);

export const CompanyRoutes = router;
