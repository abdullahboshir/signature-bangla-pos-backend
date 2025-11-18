import { startSession } from "mongoose";
import AppError from "../../../errors/AppError.js";
import type { IStoreCore } from "./business-unit.interface.js";
import { StoreCore } from "./store-core.model.js";
import { generateIncreament, makeSlug } from "../../../utils/utils.common.js";
import { sendImageToCloudinary } from "../../../utils/IMGUploader.js";
import { ULIDGenerator } from "../../../utils/generateULID.js";

export const createStoreService = async (
  storeData: IStoreCore,
  file: Express.Multer.File | undefined
) => {
  const session = await startSession();
  try {
    // Start transaction early to ensure abort/commit are valid
    let slug: string;
    session.startTransaction();

    // Check if Store already exists
    console.log('dddddddddddddddddddd', storeData)
    const isStoreAlreadyExists = await StoreCore.findOne({
      vendor: storeData.vendor,
      slug: storeData.branding.name,
    }).session(session);

    if (isStoreAlreadyExists) {
      const findRelatedSlug = await StoreCore.find({
        branding: storeData.branding.name,
      })
        .sort({ createdAt: -1 })
        .session(session);

      if (findRelatedSlug.length > 0 && findRelatedSlug[0]) {
        const lastSlugIncreamented = findRelatedSlug[0].slug.split("-").pop();

        const generatedIncreament = generateIncreament(lastSlugIncreamented);
        slug = makeSlug(storeData.branding.name + " " + generatedIncreament);
      }
    } else {
      slug = makeSlug(storeData.branding.name);
    };

    // const storeId = 
      const storeId = ULIDGenerator.generateStoreId('PRE');


    if (file) {
      try {
        const imgName = `${storeData?.branding?.name || Date.now()}-${storeId}`;
        const imgPath = file?.path;
        const { secure_url } = (await sendImageToCloudinary(
          imgName,
          imgPath
        )) as any;
        storeData.branding.banner = secure_url;
      } catch (uploadError: any) {
        console.error("Image upload failed:", uploadError);
      }
      console.log("dddddddddddd", storeId);
    }


storeData.id = storeId
    // Create Customer
    const newStore: any = await StoreCore.create([storeData], { session });

    if (!newStore || !newStore.length) {
      throw new AppError(500, "Failed to create customer profile!");
    }

    // Commit transaction
    if (session.inTransaction()) {
      await session.commitTransaction();
    }

    console.log(
      `✅ Customer created successfully: ${newStore[0].contact.email}`
    );


    return newStore;
  } catch (error: any) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error("❌ Customer creation failed:", error.message);

    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, `Failed to create customer: ${error.message}`);
  } finally {
    await session.endSession();
  }
};
