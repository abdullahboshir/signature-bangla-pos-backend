import { startSession } from "mongoose";
import type { IUser } from "./user.interface.js";


import { genereteCustomerId } from "./user.utils.js";

import { User } from "./user.model.js";
import { Role } from "../role/role.model.js";
import { UserBusinessAccess } from "../user-business-access/user-business-access.model.js";
import BusinessUnit from "../../platform/organization/business-unit/core/business-unit.model.ts";
import { USER_ROLE, USER_STATUS } from "./user.constant.ts";
import appConfig from "@shared/config/app.config.ts";
import { PermissionService } from "../permission/permission.service.js";
import AppError from "@shared/errors/app-error.ts";
const permissionService = new PermissionService();


import { Staff } from "@app/modules/platform/index.js";
import type { IStaff } from "@app/modules/platform/index.js";
import { sendImageToCloudinary } from "@core/utils/file-upload.ts";

import { QueryBuilder } from "../../../../core/database/QueryBuilder.js";
import mongoose from "mongoose";
import crypto from "crypto";
import type { ICustomer } from "@app/modules/contacts/index.js";
import { MailService } from "@shared/mail/mail.service.js";
import { Customer } from "@app/modules/contacts/index.js";
import { Merchant } from "@app/modules/platform/merchant/merchant.model.ts";

// ...

export const getUsersService = async (query: Record<string, unknown>, user: any) => {
  const { searchTerm, businessUnit, companyId, ...filterParams } = query;
  const filterData = { ...filterParams };
  const isSuperAdmin = user?.['roleName']?.includes("super-admin");

  // 1. Handle Context Scoping (Company or Business Unit)
  let userIds: mongoose.Types.ObjectId[] | null = null;

  if (businessUnit) {
    let buId = businessUnit as string;
    if (!mongoose.Types.ObjectId.isValid(buId) && !/^[0-9a-fA-F]{24}$/.test(buId)) {
      const BusinessUnit = mongoose.model("BusinessUnit");
      const bu = await BusinessUnit.findOne({ slug: buId });
      if (bu) buId = bu._id.toString();
    }

    userIds = await UserBusinessAccess.distinct('user', {
      $or: [{ businessUnit: buId }, { scope: 'GLOBAL' }]
    });
  } else if (companyId) {
    userIds = await UserBusinessAccess.distinct('user', { company: companyId });
  } else if (!isSuperAdmin) {
    // Implicit scoping for Company Owners
    const authorizedCompanyIds = user?.companies || [];
    if (authorizedCompanyIds.length > 0) {
      userIds = await UserBusinessAccess.distinct('user', {
        company: { $in: authorizedCompanyIds.map((id: string) => new mongoose.Types.ObjectId(id)) }
      });
    } else {
      userIds = [];
    }
  }

  if (userIds !== null) {
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
      // Ensure businessUnit is passed. If missing, it will fail at model validation.
      businessUnit: customerData.businessUnit,
      outlet: customerData.outlet || null
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
  staffData: IStaff & { directPermissions?: any[] },
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

    // 5.1 Validate Direct Permissions (Security Step 3)
    // Staff are usually created by Business Admins or Managers. 
    // They should NOT have GLOBAL permissions.
    if (staffData.directPermissions && staffData.directPermissions.length > 0) {
      const { Permission } = await import("../permission/permission.model.js");
      const permissionIds = staffData.directPermissions.map((p: any) => p.permissionId);
      const permissions = await Permission.find({ _id: { $in: permissionIds } });

      // Max Scope for Staff Creation:
      // If creating for a Business Unit -> Max Scope = BUSINESS
      // If Global -> Max Scope = GLOBAL (but createsStaffService usually implies BU context?)
      // Let's assume implied max scope:
      const maxScopeVal = (!businessUnitId) ? 3 : 2; // If no BU, maybe Global admin? Safest is 2 if strictly staff.
      // Actually, strictly enforce: Created Staff cannot exceed creator's scope?
      // For now, hard rule: Staff = BUSINESS Max.

      const scopeRank = { 'OUTLET': 1, 'BUSINESS': 2, 'GLOBAL': 3 };
      for (const p of permissions) {
        const pScopeVal = scopeRank[p.scope as keyof typeof scopeRank] || 0;
        if (pScopeVal > maxScopeVal) {
          throw new AppError(403, `Security Violation: Cannot assign ${p.scope} permission to new staff.`);
        }
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
      directPermissions: staffData.directPermissions || []
    };

    const newUser = await User.create([userData], { session });
    if (!newUser || !newUser.length || !newUser[0]) throw new AppError(500, "Failed to create user account");

    // 7. Create User Business Access (If Business Unit is provided)
    const bu = await BusinessUnit.findById(businessUnitId).session(session);
    if (businessUnitId) {
      console.log("businessUnitId", businessUnitId, bu);
      const accessPayload = {
        user: newUser[0]._id,
        role: roleId,
        scope: 'BUSINESS',
        company: bu?.company || (staffData as any).company,
        businessUnit: businessUnitId,
        outlet: null,
        status: 'ACTIVE'
      };
      await UserBusinessAccess.create([accessPayload], { session });
    }

    // 8. Create Staff Profile
    const staffPayload: Partial<IStaff> = {
      ...staffData,
      user: newUser[0]!._id,
      company: bu?.company || (staffData as any).company,
      businessUnit: (businessUnitId as any)?._id || businessUnitId,
      isActive: true,
      isDeleted: false
    };

    const newStaff = await Staff.create([staffPayload], { session });
    if (!newStaff || !newStaff.length) throw new AppError(500, "Failed to create staff profile");

    // 400. Staff Created
    // const newStaff = ... (already created above)

    // 9. Send Invitation Email
    // Generate Token
    const crypto = await import("crypto");
    const setupToken = crypto.default.randomBytes(32).toString('hex');
    const setupExpires = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours

    // Update User with Token
    await User.findByIdAndUpdate(newUser[0]._id, {
      setupPasswordToken: setupToken,
      setupPasswordExpires: setupExpires
    }).session(session);

    try {
      const { MailService } = await import("@shared/mail/mail.service.js");
      const setupUrl = `${appConfig.frontend_url}/auth/setup-password?token=${setupToken}`;

      await MailService.sendEmail(
        email,
        "Unified Solution - Staff Account Invitation",
        `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #0F172A; text-align: center;">You've been invited!</h2>
                <p>Hello <strong>${staffData.firstName}</strong>,</p>
                <p>You have been added as a staff member to <strong>Unified Solution</strong>.</p>
                <p>Please click the link below to set up your password and access your account.</p>
                <div style="margin: 30px 0; text-align: center;">
                <a href="${setupUrl}" style="background-color: #0F172A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Accept Invitation</a>
                </div>
                <p style="font-size: 14px; color: #666;">Or copy this link: <br/> <a href="${setupUrl}">${setupUrl}</a></p>
                <p style="font-size: 14px; color: #666;">This link expires in 72 hours.</p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                <p style="font-size: 12px; color: #94a3b8; text-align: center;">© 2026 Unified Solution. All rights reserved.</p>
            </div>
            `
      );
    } catch (msgError) {
      console.error("Failed to send staff invitation email", msgError);
    }

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


  // Validate Direct Permissions Scope if being updated
  if (payload.directPermissions && payload.directPermissions.length > 0) {
    const { Permission } = await import("../permission/permission.model.js"); // Dynamic import to avoid circular dep
    const permissionIds = payload.directPermissions.map((p: any) => p.permissionId);

    // Fetch permissions to check their scope
    const permissions = await Permission.find({ _id: { $in: permissionIds } });

    // Determine User's Max Access Scope
    // Logic: SuperAdmin > BusinessAdmin > OutletManager
    // This is simplified. Ideally, we check against specific Business Unit context.
    // For now, we prevent GLOBAL permissions for non-SuperAdmins.

    let userMaxScopeVal = 1; // Default Outlet

    // Check if user has explicit global roles or super admin status (PRE-UPDATE state)
    // Note: If payload changes roles, we should check payload. Assume role changes handled separately?
    // Using current state for safety.
    if (isUserExists.isSuperAdmin || (isUserExists.globalRoles && isUserExists.globalRoles.length > 0)) {
      userMaxScopeVal = 3; // Global
    } else {
      // Check business access
      // We might need to fetch UserBusinessAccess if not populated.
      // Assuming if not SuperAdmin/GlobalRole, they are Business/Outlet level.
      // Let's assume BUSINESS level (2) is max for normal staff for now, unless restricted.
      userMaxScopeVal = 2;
    }

    const scopeRank = { 'OUTLET': 1, 'BUSINESS': 2, 'GLOBAL': 3 };

    for (const p of permissions) {
      const pScopeVal = scopeRank[p.scope as keyof typeof scopeRank] || 0;

      if (pScopeVal > userMaxScopeVal) {
        throw new AppError(403, `Security Violation: Cannot assign ${p.scope} permission '${p.action}:${p.resource}' to a user with lower scope.`);
      }
    }
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

export const createCompanyOwnerService = async (
  companyData: {
    contactEmail: string;
    name: string;
    contactPhone: string;
    legalRepresentative?: {
      name?: string;
      designation?: string;
      contactPhone?: string;
      email?: string;
      nationalId?: string;
    }
  },
  companyId: string,
  session: any
) => {
  // 1. Check if user already exists
  const isUserExists = await User.findOne({ email: companyData.contactEmail }).session(session);

  if (isUserExists) {
    // 1.1 Handle PENDING User (User exists but never set password)
    if (isUserExists.status === USER_STATUS.PENDING) {
      // Check/Regenerate Token
      const crypto = await import("crypto");
      const setupToken = crypto.default.randomBytes(32).toString('hex');
      const setupExpires = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours

      isUserExists.setupPasswordToken = setupToken;
      isUserExists.setupPasswordExpires = setupExpires;
      await isUserExists.save({ session });

      // Create Access & Merchant if missing (Logic shared with Active logic below)
      // TO REDUCE DUPLICATION, we can extract Access/Merchant logic?
      // For now, let's keep it inline but ensure we send the CORRECT email.

      // Ensure Merchant/Access exists (Copying logic from below)
      const ownerRole = await Role.findOne({ name: USER_ROLE.COMPANY_OWNER }).session(session);
      if (!ownerRole) throw new AppError(500, "FATAL: COMPANY_OWNER role missing in system");

      const existingMerchant = await Merchant.findOne({ user: isUserExists._id }).session(session);
      if (!existingMerchant) {
        await Merchant.create([{
          user: isUserExists._id,
          firstName: companyData.legalRepresentative?.name || companyData.name,
          lastName: companyData.legalRepresentative?.name ? "" : "Owner",
          phone: companyData.legalRepresentative?.contactPhone || companyData.contactPhone,
          nidNumber: companyData.legalRepresentative?.nationalId,
          isEmailVerified: true,
          isActive: true
        }], { session });
      }

      // Create Access
      await UserBusinessAccess.create([{
        user: isUserExists._id,
        role: ownerRole._id,
        scope: 'COMPANY',
        company: companyId,
        status: 'ACTIVE',
        isPrimary: true
      }], { session });

      // Send SETUP Email
      try {
        const setupUrl = `${appConfig.frontend_url}/auth/setup-password?token=${setupToken}`;
        await MailService.sendEmail(
          companyData.contactEmail,
          "Welcome to Unified Solution - Set up your account",
          `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
              <h2 style="color: #0F172A; text-align: center;">Welcome to Unified Solution</h2>
              <p>Hello <strong>${companyData.legalRepresentative?.name || 'Partner'}</strong>,</p>
              <p>Your new company <strong>${companyData.name}</strong> has been provisioned.</p>
              <p>We noticed your account was pending setup. Please set your password now.</p>
              <div style="margin: 30px 0; text-align: center;">
                <a href="${setupUrl}" style="background-color: #0F172A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Set Up Password</a>
              </div>
              <p style="font-size: 14px; color: #666;">Or copy this link: <br/> <a href="${setupUrl}">${setupUrl}</a></p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
            </div>
            `
        );
      } catch (e) { console.error("Failed to send setup email", e); }

      return isUserExists;
    }

    // 1.2 Handle ACTIVE User (Existing logic)
    // Find COMPANY_OWNER role
    const ownerRole = await Role.findOne({ name: USER_ROLE.COMPANY_OWNER }).session(session);
    if (!ownerRole) throw new AppError(500, "FATAL: COMPANY_OWNER role missing in system");

    // Check & Create Merchant Profile if missing
    const existingMerchant = await Merchant.findOne({ user: isUserExists._id }).session(session);
    if (!existingMerchant) {
      await Merchant.create([{
        user: isUserExists._id,
        firstName: companyData.legalRepresentative?.name || companyData.name,
        lastName: companyData.legalRepresentative?.name ? "" : "Owner",
        phone: companyData.legalRepresentative?.contactPhone || companyData.contactPhone,
        nidNumber: companyData.legalRepresentative?.nationalId,
        isEmailVerified: true,
        isActive: true
      }], { session });
    }

    // Create Access
    await UserBusinessAccess.create([{
      user: isUserExists._id,
      role: ownerRole._id,
      scope: 'COMPANY',
      company: companyId,
      status: 'ACTIVE',
      isPrimary: true
    }], { session });

    try {
      await MailService.sendEmail(
        companyData.contactEmail,
        "New Company Added - Unified Solution",
        `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0F172A; text-align: center;">New Company Added</h2>
          <p>Hello <strong>${isUserExists.name?.firstName || 'Partner'}</strong>,</p>
          <p>A new company <strong>${companyData.name}</strong> has been successfully added to your Unified Solution account.</p>
          <p>You can now switch to this company from your dashboard.</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${appConfig.frontend_url}/login" style="background-color: #0F172A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Login to Dashboard</a>
          </div>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="font-size: 12px; color: #94a3b8; text-align: center;">© 2026 Unified Solution. All rights reserved.</p>
        </div>
        `
      );
    } catch (e) {
      console.error("Failed to send association email", e);
    }

    return isUserExists;
  }


  // 2. Create New User
  const ownerRole = await Role.findOne({ name: USER_ROLE.COMPANY_OWNER }).session(session);
  if (!ownerRole) throw new AppError(500, "FATAL: COMPANY_OWNER role missing in system");

  const userId = await genereteCustomerId(companyData.contactEmail, ownerRole._id.toString());

  // 2.1 Generate Setup Token (Industrial Standard)
  const setupToken = crypto.randomBytes(32).toString('hex');
  const setupExpires = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours expiry

  const userData: Partial<IUser> = {
    id: userId,
    email: companyData.contactEmail,
    phone: companyData.contactPhone,
    // Provide a random password to satisfy model requirement (will be reset by user via token)
    password: crypto.randomBytes(24).toString('hex'),
    status: "pending", // Pending until password setup
    needsPasswordChange: true,
    setupPasswordToken: setupToken,
    setupPasswordExpires: setupExpires,
    name: {
      firstName: companyData.legalRepresentative?.name?.split(" ")[0] || "Company",
      lastName: companyData.legalRepresentative?.name?.split(" ").slice(1).join(" ") || "Admin"
    },
    globalRoles: [],
    isEmailVerified: true
  };

  const newUser = await User.create([userData], { session });
  if (!newUser || !newUser[0]) throw new AppError(500, "Failed to create Company Owner user");

  // 2.2 Create Merchant Profile (Industrial Standard Consistency)
  const merchantData: any = {
    user: newUser[0]._id,
    firstName: companyData.legalRepresentative?.name || companyData.name,
    lastName: companyData.legalRepresentative?.name ? "" : "Owner",
    phone: companyData.legalRepresentative?.contactPhone || companyData.contactPhone,
    nidNumber: companyData.legalRepresentative?.nationalId,
    isEmailVerified: true,
    isActive: true
  };

  await Merchant.create([merchantData], { session });

  // 3. Create Access
  await UserBusinessAccess.create([{
    user: newUser[0]._id,
    role: ownerRole._id,
    scope: 'COMPANY',
    company: companyId,
    status: 'ACTIVE',
    isPrimary: true
  }], { session });

  try {
    // 4. Send Invitation Email (Industrial Standard)
    const setupUrl = `${appConfig.frontend_url}/auth/setup-password?token=${setupToken}`;

    await MailService.sendEmail(
      companyData.contactEmail,
      "Welcome to Unified Solution - Set up your account",
      `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0F172A; text-align: center;">Welcome to Unified Solution</h2>
        <p>Hello <strong>${companyData.legalRepresentative?.name || 'Partner'}</strong>,</p>
        <p>Your company <strong>${companyData.name}</strong> has been successfully provisioned in our system.</p>
        <p>Please utilize the link below to establish a secure password for your administrative account.</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${setupUrl}" style="background-color: #0F172A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Set Up Password</a>
        </div>
        <p style="font-size: 14px; color: #666;">Or copy this link: <br/> <a href="${setupUrl}">${setupUrl}</a></p>
        <p style="font-size: 14px; color: #666;">This secure link is valid for 72 hours.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">© 2026 Unified Solution. All rights reserved.</p>
      </div>
      `
    );
  } catch (emailError) {
    console.error("Failed to send welcome email:", emailError);
    // Suppress error so company creation doesn't fail, but log it critical
  }

  return newUser[0];
};
