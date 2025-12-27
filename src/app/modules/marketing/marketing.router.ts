import express from 'express';
import { adCampaignController, pixelController, syncAdCampaigns } from './marketing.controller.ts';
// import { auth } from '@app/middlewares/auth';
// import { USER_ROLE } from '@app/modules/iam/user/user.constant';

const router = express.Router();

// Ad Campaigns Routes
router.post('/campaigns', adCampaignController.create.bind(adCampaignController));
router.get('/campaigns', adCampaignController.getAll.bind(adCampaignController));
router.get('/campaigns/:id', adCampaignController.getById.bind(adCampaignController));
router.patch('/campaigns/:id', adCampaignController.update.bind(adCampaignController));
router.delete('/campaigns/:id', adCampaignController.delete.bind(adCampaignController));
router.post('/campaigns/sync', syncAdCampaigns);

// Pixel Routes
router.post('/pixels', pixelController.create.bind(pixelController));
router.get('/pixels', pixelController.getAll.bind(pixelController));
router.get('/pixels/:id', pixelController.getById.bind(pixelController));
router.patch('/pixels/:id', pixelController.update.bind(pixelController));
router.delete('/pixels/:id', pixelController.delete.bind(pixelController));

export const marketingRoutes = router;
