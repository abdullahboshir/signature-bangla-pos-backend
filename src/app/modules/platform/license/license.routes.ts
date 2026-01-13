import express from 'express';
import { LicenseController } from './license.controller.ts';

const router = express.Router();

// Protected Routes (TODO: Middleware)
router.post('/', LicenseController.createLicense);
router.get('/', LicenseController.getAllLicenses);
router.post('/validate', LicenseController.validateLicense);
router.post('/calculate-price', LicenseController.calculatePrice);
router.patch('/:id/revoke', LicenseController.revokeLicense);
router.patch('/:id', LicenseController.updateLicense); // Add Update Route

export const LicenseRoutes = router;
