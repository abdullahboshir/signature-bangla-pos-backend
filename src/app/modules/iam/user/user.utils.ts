
import { generateIncreament } from "@core/utils/utils.common.ts";
import { USER_ROLE } from "./user.constant.js";
import { User } from "./user.model.js";


export const findLastUser = async (
  role: string
): Promise<string | undefined> => {
  try {
    const lastUser = await User.findOne({ role }, { id: 1 })
      .sort({ createdAt: -1 })
      .lean();

    return typeof lastUser?.id === "string" ? lastUser.id : undefined;
  } catch (error) {
    console.error("Error fetching last student user:", error);
    return undefined;
  }
};



export const genereteCustomerId = async (email: string, roleId: string) => {

  const emailPrefix = email.split("@")[0];
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const lastUserId = await findLastUser(USER_ROLE?.CUSTOMER);
  const newIncrement = generateIncreament(lastUserId);

  if (!newIncrement) {
    throw new Error("Failed to generate customer ID!");
  }

  const finalId = `${roleId}-${date}-${emailPrefix + newIncrement}`;
  return finalId;
};
