import { StoreCore } from "../store-core/store-core.model.js";

export const findLastCommonStore = async (
  role: string
): Promise<string | undefined> => {
  try {
    const lastUser = await StoreCore.findOne({ role }, { id: 1 })
      .sort({ createdAt: -1 })
      .lean();

    return typeof lastUser?.id === "string" ? lastUser.id : undefined;
  } catch (error) {
    console.error("Error fetching last student user:", error);
    return undefined;
  }
};