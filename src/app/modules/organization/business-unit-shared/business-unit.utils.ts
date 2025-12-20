import { Outlet } from "../outlet/outlet.model.ts";


export const findLastCommonStore = async (
  role: string
): Promise<string | undefined> => {
  try {
    const lastUser = await Outlet.findOne({ role }, { id: 1 })
      .sort({ createdAt: -1 })
      .lean();

    return typeof lastUser?.id === "string" ? lastUser.id : undefined;
  } catch (error) {
    console.error("Error fetching last student user:", error);
    return undefined;
  }
};