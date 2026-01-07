import { GenericController } from "@core/controllers/GenericController.ts";
import { AdCampaignService, PixelService } from "./marketing.service.js";
import catchAsync from "@core/utils/catchAsync.ts";
import { ApiResponse } from "@core/utils/api-response.ts";

const adCampaignServiceMap = {
    create: AdCampaignService.createAdCampaign,
    getAll: AdCampaignService.getAllAdCampaigns,
    getById: AdCampaignService.getAdCampaignById,
    update: AdCampaignService.updateAdCampaign,
    delete: AdCampaignService.deleteAdCampaign
};

const pixelServiceMap = {
    create: PixelService.createPixel,
    getAll: PixelService.getAllPixels,
    getById: PixelService.getPixelById,
    update: PixelService.updatePixel,
    delete: PixelService.deletePixel
};

// Create generic controllers for CRUD
export const adCampaignController = new GenericController(adCampaignServiceMap, 'AdCampaign');
export const pixelController = new GenericController(pixelServiceMap, 'Pixel');

// Custom method for Sync
export const syncAdCampaigns = catchAsync(async (_req, res) => {
    // const { adAccountId, accessToken } = req.body; 
    // await AdCampaignService.syncCampaignsFromMeta(adAccountId, accessToken);

    ApiResponse.success(
        res,
        { status: "initiated" },
        "Ad Campaigns sync initiated (Placeholder)",
        200
    );
});
