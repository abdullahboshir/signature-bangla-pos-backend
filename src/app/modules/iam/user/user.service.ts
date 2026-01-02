import { startSession } from "mongoose";
import type { IUser } from "./user.interface.js";


import { genereteCustomerId } from "./user.utils.js";

import { User } from "./user.model.js";
import { Role } from "../role/role.model.js";
import { UserBusinessAccess } from "../user-business-access/user-business-access.model.js";
import BusinessUnit from "../../platform/organization/business-unit/core/business-unit.model.ts";
import { USER_ROLE } from "./user.constant.ts";
import appConfig from "@shared/config/app.config.ts";
import { PermissionService } from "../permission/permission.service.js";
import AppError from "@shared/errors/app-error.ts";
const permissionService = new PermissionService();


import { Staff } from "@app/modules/platform/staff/staff.model.ts";
import type { IStaff } from "@app/modules/platform/staff/staff.interface.ts";
import { sendImageToCloudinary } from "@core/utils/file-upload.ts";

import { QueryBuilder } from "../../../../core/database/QueryBuilder.js";
import mongoose from "mongoose";
import type { ICustomer } from "@app/modules/contacts/customers/customer.interface.ts";
import Customer from "@app/modules/contacts/customers/customer.model.ts";

// ...

export const getUsersService = async (query: Record<string, unknown>) => {
  const { searchTerm, businessUnit, ...filterData } = query;

  // Handle Business Unit Filter (Array Match)
  // Handle Business Unit Filter (Via UserBusinessAccess)
  if (businessUnit) {
    let buId = businessUnit as string;

    // Resolve Slug if needed
    if (!mongoose.Types.ObjectId.isValid(buId) && !/^[0-9a-fA-F]{24}$/.test(buId)) {
      const BusinessUnit = mongoose.model("BusinessUnit");
      const bu = await BusinessUnit.findOne({ slug: buId });
      if (bu) buId = bu._id.toString();
    }

    // Find users who have access to this Business Unit
    const userIds = await UserBusinessAccess.distinct('user', {
      $or: [
        { businessUnit: buId }, // Direct Business Scope
        { scope: 'GLOBAL' }     // Global Admins (Optional: Do we want to show Globals when filtering by BU? Usually yes.)
      ]
    });

    // Merge into filter
    // If existing _id filter, we must intersect? 
    // Usually filterData doesn't have _id unless specific.
    (filterData as any)._id = { $in: userIds };
  }

  const userQuery = new QueryBuilder(
    User.find()
      .populate({
        path: "globalRoles",
        select: "name title isSystemRole"
      })
      // Assuming we add a virtual 'businessAccess' to User model to link to UserBusinessAccess collection
      // This preserves API structure for frontend (array of access objects)
      .populate({
        path: "businessAccess", // Virtual
        select: "role businessUnit outlet scope status isPrimary dataScopeOverride",
        populate: [
          { path: "role", select: "name title" },
          { path: "businessUnit", select: "name slug" },
          { path: "outlet", select: "name" }
        ]
      })
      .select("-password"), // safe
    filterData
  )
    .search(['email', 'phone', 'name.firstName', 'name.lastName']) // Searchable fields
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await userQuery.modelQuery;
  const meta = await userQuery.countTotal();

  return {
    meta,
    result
  };
};

export const createCustomerService = async (
  customerData: ICustomer,
  password: string,
  file: any | undefined
) => {
  const session = await startSession();
  try {
    // Start transaction early to ensure abort/commit are valid
    session.startTransaction();

    // Check if user already exists
    const isUserExists = await User.findOne({
      email: customerData.email,
    }).session(session);

    if (isUserExists) {
      console.log("dddddddddddd", customerData.phone);
      throw new AppError(400, "User with this email already exists!");
    }

    // Check if phone already exists (if provided)
    if (customerData.phone) {
      const phoneExists = await User.findOne({
        phone: customerData.phone,
      }).session(session);
      if (phoneExists) {
        throw new AppError(400, "User with this phone number already exists!");
      }
    }

    // Get customer role
    const role = await Role.findOne({
      name: USER_ROLE.CUSTOMER,
      isActive: true,
    }).session(session);
    if (!role) {
      throw new AppError(404, "Customer role not found!");
    }

    // Generate customer ID
    const id = await genereteCustomerId(
      customerData?.email,
      role._id.toString()
    );

    // Handle file upload
    if (file) {
      try {
        const imgName = `${customerData?.name?.firstName || Date.now()}-${id}`;
        const imgPath = file?.path;
        const { secure_url } = (await sendImageToCloudinary(
          imgName,
          imgPath
        )) as any;
        customerData.avatar = secure_url;
      } catch (uploadError: any) {
        console.error("Image upload failed:", uploadError);
        // Continue without avatar
      }
    }

    // Prepare user data
    const userData: Partial<IUser> = {
      id,
      email: customerData.email,
      password: password || (appConfig.default_pass as string),
      // Assign Customer Role Globally
      globalRoles: [role._id],
      status: "pending",
      needsPasswordChange: !password,
      avatar: customerData.avatar as string,
    };

    if (customerData.phone) {
      userData.phone = customerData.phone;
    }

    // Create User
    const newUser: any = await User.create([userData], { session });

    if (!newUser || !newUser.length) {
      throw new AppError(500, "Failed to create user account!");
    }

    // Prepare customer data
    const customerPayload: ICustomer = {
      ...customerData,
      id,
      user: newUser[0]._id as any,
      email: customerData.email,
    };

    // Create Customer
    const newCustomer: any = await Customer.create([customerPayload], {
      session,
    });

    if (!newCustomer || !newCustomer.length) {
      throw new AppError(500, "Failed to create customer profile!");
    }

    // Commit transaction
    if (session.inTransaction()) {
      await session.commitTransaction();
    }

    console.log(`✅ Customer created successfully: ${newCustomer[0].email}`);

    // Return customer with populated user data
    const result = await Customer.findById(newCustomer[0]._id).populate({
      path: "user",
      select: "-password",
      populate: {
        path: "roles",
        select: "name description",
      },
    });

    return result;
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

export const createStaffService = async (
  staffData: IStaff,
  password: string,
  file: any | undefined
) => {
  const session = await startSession();
  try {
    session.startTransaction();

    // 1. Check if user exists
    // We assume staffData has an email or phone to identify
    // But IStaff interface uses 'user' ref. The controller should pass a combined payload or we extract user fields.
    // For now, let's assume staffData comes with an 'email' field attached (even if not in IStaff strictly, but usually passed from controller)
    const email = (staffData as any).email;
    const phone = (staffData as any).phone;

    if (email) {
      const isUserExists = await User.findOne({ email }).session(session);
      if (isUserExists) throw new AppError(400, "User with this email already exists!");
    }

    if (phone) {
      const isPhoneExists = await User.findOne({ phone }).session(session);
      if (isPhoneExists) throw new AppError(400, "User with this phone already exists!");
    }

    // 2. Resolve Role
    // The controller passes the Role ID (usually) or Name. 
    let roleId = (staffData as any).role;

    // Default to STAFF role from constant (lowercase 'staff')
    const defaultRoleName = USER_ROLE.STAFF;

    // If no roleId provided, try to find one by designation/default
    if (!roleId) {
      // Try finding role by Name (Designation) - assuming designation matches role slug loosely? 
      // Or just fallback to default STAFF if designation doesn't map to a role.
      // Usually designation is just a title (e.g. "Senior Dev"). It shouldn't strictly imply a system Role.
      // Safest is to default to 'staff' unless specific role provided.

      const defaultRole = await Role.findOne({ name: defaultRoleName }).session(session);
      if (!defaultRole) throw new AppError(404, `Role not found for staff creation (Default '${defaultRoleName}' role missing)`);
      roleId = defaultRole._id;

    } else {
      // Role ID IS provided.
      // Check if it's a valid ObjectId (DB ID) or a Name String (e.g. "manager")
      const isValidId = mongoose.isValidObjectId(roleId);

      if (!isValidId) {
        // It's a Name string
        const roleByName = await Role.findOne({ name: roleId }).session(session);
        if (!roleByName) {
          // Fallback to default
          const defaultRole = await Role.findOne({ name: defaultRoleName }).session(session);
          if (!defaultRole) throw new AppError(404, `Role '${roleId}' not found and default '${defaultRoleName}' role missing`);
          roleId = defaultRole._id;
        } else {
          roleId = roleByName._id;
        }
      }
    }

    // 3. Resolve Business Unit ID
    // Check if businessUnit is provided and resolve it
    let businessUnitId = (staffData as any).businessUnit;
    if (businessUnitId) {
      const bu = await BusinessUnit.findOne({
        $or: [
          { id: businessUnitId }, // Custom ID (BU-xxxx)
          { _id: mongoose.isValidObjectId(businessUnitId) ? businessUnitId : null }
        ]
      }).session(session);

      if (!bu) {
        throw new AppError(404, `Business Unit '${businessUnitId}' not found`);
      }
      businessUnitId = bu._id;
    }

    // 4. Generate ID
    const userId = await genereteCustomerId(email, roleId.toString());

    // 5. Handle Avatar
    let avatarUrl = "";
    if (file) {
      try {
        const imgName = `${staffData.firstName}-${userId}`;
        const { secure_url } = (await sendImageToCloudinary(imgName, file.path)) as any;
        avatarUrl = secure_url;
      } catch (e) {
        console.error("Avatar upload failed", e);
      }
    }

    // 6. Create User
    const userData: Partial<IUser> = {
      id: userId,
      email: email,
      phone: phone,
      password: password || (appConfig.default_pass as string),
      // Staff roles are usually assigned via UserBusinessAccess (Scoped)
      // unless it's a Platform Admin which might be in globalRoles.
      // Here we assume scoped assignment if BU is present.
      globalRoles: !businessUnitId ? [roleId] : [],
      status: "pending",
      needsPasswordChange: !password,
      avatar: avatarUrl,
      name: {
        firstName: staffData.firstName,
        lastName: staffData.lastName
      },
      directPermissions: staffData.directPermissions
    };

    const newUser = await User.create([userData], { session });
    if (!newUser || !newUser.length || !newUser[0]) throw new AppError(500, "Failed to create user account");

    // 7. Create User Business Access (If Business Unit is provided)
    if (businessUnitId) {
      const accessPayload = {
        user: newUser[0]._id,
        role: roleId,
        scope: 'BUSINESS',
        businessUnit: businessUnitId,
        outlet: null,
        status: 'active'
      };
      await UserBusinessAccess.create([accessPayload], { session });
    }

    // 8. Create Staff Profile
    const staffPayload: Partial<IStaff> = {
      ...staffData,
      user: newUser[0]!._id,
      businessUnit: (businessUnitId as any)?._id || businessUnitId,
      isActive: true,
      isDeleted: false
    };

    const newStaff = await Staff.create([staffPayload], { session });
    if (!newStaff || !newStaff.length) throw new AppError(500, "Failed to create staff profile");

    await session.commitTransaction();
    console.log(`✅ Staff created: ${email} (${newStaff[0]?._id})`);

    // Return with simplified population (UserBusinessAccess not populated here, purely Staff view)
    return await Staff.findById(newStaff[0]?._id).populate('user').populate('businessUnit');

  } catch (error: any) {
    if (session.inTransaction()) await session.abortTransaction();
    throw new AppError(500, error.message);
  } finally {
    await session.endSession();
  }
};


export const updateUserService = async (
  userId: string,
  payload: Partial<IUser>,
  file: any
) => {
  const isUserExists = await User.findById(userId);

  if (!isUserExists) {
    throw new AppError(404, "User not found!");
  }

  // Handle Image Upload
  if (file) {
    const imgName = `${payload.name?.firstName || isUserExists.name?.firstName || 'user'}-${Date.now()}`;
    const { secure_url } = (await sendImageToCloudinary(imgName, file.path)) as any;
    payload.avatar = secure_url;
  }

  // Handle Business Access (Virtual Sync) - Enterprise Grade Access Management
  if (payload.businessAccess && Array.isArray(payload.businessAccess)) {
    const existingAccess = await UserBusinessAccess.find({ user: userId });

    const payloadIds = (payload.businessAccess as any[]).map((a: any) => a._id || a.id).filter(Boolean);
    const existingIds = existingAccess.map((a: any) => a._id.toString());

    // Delete removed assignments
    const toDelete = existingIds.filter(id => !payloadIds.includes(id));
    if (toDelete.length > 0) {
      await UserBusinessAccess.deleteMany({ _id: { $in: toDelete } });
    }

    // Upsert assignments
    for (const item of (payload.businessAccess as any[])) {
      // If setting as primary, unset others to ensure single primary context
      if (item.isPrimary) {
        await UserBusinessAccess.updateMany({ user: userId }, { isPrimary: false });
      }

      if (item._id || item.id) {
        await UserBusinessAccess.findByIdAndUpdate(item._id || item.id, { ...item, user: userId }, { new: true });
      } else {
        await UserBusinessAccess.create({ ...item, user: userId });
      }
    }

    // Remove from payload to prevent Mongoose schema Strict Mode error
    delete payload.businessAccess;
  }

  // Security: Prevent updating password through this route to avoid hashing issues/accidental overwrites
  if (payload.password) {
    console.warn("⚠️ Attempted to update password via updateUserService. Removing password from payload.");
    delete payload.password;
  }

  console.log("updateUserService Payload (After Sanitation):", payload);

  const result = await User.findByIdAndUpdate(userId, payload, {
    new: true,
  }).populate({
    path: "businessAccess",
    select: 'role businessUnit outlet scope status isPrimary dataScopeOverride',
    populate: [
      { path: "role", select: "name title isSystemRole" },
      { path: "businessUnit", select: "name slug" }
    ]
  });

  // Invalidate Permission Cache for this user
  await permissionService.invalidateUserCache(userId);

  return result;
};

// Find a single user by ID
export const getSingleUserService = async (id: string) => {
  const result = await User.findById(id)
    .populate({
      path: "globalRoles",
      select: "name title isSystemRole"
    })
    .populate({
      path: "businessAccess",
      populate: [
        { path: "role", select: "name title" },
        { path: "businessUnit", select: "name slug" }
      ]
    })
    .select('+directPermissions');
  return result;
};

export const updateProfileService = async (
  userId: string,
  payload: Partial<IUser>,
  file: any
) => {
  const isUserExists = await User.findById(userId);

  if (!isUserExists) {
    throw new AppError(404, "User not found!");
  }

  // Handle Image Upload
  if (file) {
    const imgName = `${payload.name?.firstName || isUserExists.name?.firstName || 'user'}-${Date.now()}`;
    const { secure_url } = (await sendImageToCloudinary(imgName, file.path)) as any;
    payload.avatar = secure_url;
  }

  // Security: Prevent updating password
  if (payload.password) delete payload.password;
  // Prevent role/status update from profile
  if (payload.globalRoles) delete payload.globalRoles;
  if (payload.status) delete payload.status;

  const result = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  }).populate({
    path: "businessAccess",
    select: 'role businessUnit outlet scope status isPrimary dataScopeOverride',
    populate: [
      { path: "role", select: "name title isSystemRole" },
      { path: "businessUnit", select: "name slug" }
    ]
  });

  // Invalidate Cache
  await permissionService.invalidateUserCache(userId);

  return result;
};

export const getUserSettingsService = async (userId: string) => {
  const user = await User.findById(userId).select("settings");
  return user?.settings || {};
};

export const updateUserSettingsService = async (
  userId: string,
  settings: { theme?: string; tableHeight?: string }
) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { settings } },
    { new: true, runValidators: true }
  ).select("settings");

  if (!user) {
    throw new AppError(404, "User not found");
  }

  return user.settings;
};

export const deleteUserService = async (userId: string) => {
  const isUserExists = await User.findById(userId);

  if (!isUserExists) {
    throw new AppError(404, "User not found!");
  }

  // Optional: Prevent deleting super-admin if needed, or specific important users
  // if (isUserExists.role === 'super-admin') throw new AppError(403, "Cannot delete Super Admin");

  const result = await User.findByIdAndDelete(userId);
  return result;
};
