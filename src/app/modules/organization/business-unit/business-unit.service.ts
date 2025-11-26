import { startSession } from "mongoose";

import { generateIncreament, makeSlug } from "@core/utils/utils.common.ts";
import { ULIDGenerator } from "@core/utils/generateULID.ts";
import { sendImageToCloudinary } from "@core/utils/file-upload.ts";
import AppError from "@shared/errors/app-error.ts";
import { BusinessUnitCore } from "./business-unit.model.ts";
import type { IBusinessUnitCore } from "./business-unit.interface.ts";


export const createStoreService = async (
  storeData: IBusinessUnitCore,
  file: Express.Multer.File | undefined
) => {
  const session = await startSession();
  try {
    // Start transaction early to ensure abort/commit are valid
    let slug: string;
    session.startTransaction();

    // Check if Store already exists
    console.log('dddddddddddddddddddd', storeData)
    const isStoreAlreadyExists = await BusinessUnitCore.findOne({
      vendor: storeData.vendor,
      slug: storeData.branding.name,
    }).session(session);

    if (isStoreAlreadyExists) {
      const findRelatedSlug = await BusinessUnitCore.find({
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
    const newStore: any = await BusinessUnitCore.create([storeData], { session });

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
