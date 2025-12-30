import express from 'express';
// import auth from '../../middlewares/auth';
// import { USER_ROLE } from '../iam/user/user.constant';
import { PackageController } from './package.controller.ts';

const router = express.Router();

// Public routes for pricing page
router.get('/', PackageController.getAllPackages);
router.get('/:id', PackageController.getPackageById);

// Protected routes (Super Admin only - TODO: Add auth middleware)
router.post('/', PackageController.createPackage);
router.patch('/:id', PackageController.updatePackage);
router.delete('/:id', PackageController.deletePackage);

export const PackageRoutes = router;
