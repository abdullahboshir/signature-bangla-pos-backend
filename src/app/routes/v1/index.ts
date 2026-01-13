import { Router } from "express";

// import businessAdminRoutes from "./vendor";

import { authGroupRoutes } from "./auth/auth.routes.js";
import { adminGroupRoutes } from "./super-admin/index.js";
import { customerGroupRoutes } from "./customer/index.js";
import { publicGroupRoutes } from "./public/index.js";
import { PackageRoutes } from "../../modules/platform/package/package.routes.ts";
import { LicenseRoutes } from "../../modules/platform/license/license.routes.ts";
import { CompanyRoutes } from "../../modules/platform/organization/company/company.routes.ts";
import { userRoutes } from "../../modules/iam/user/user.routes.ts";
import { DepartmentRoutes } from "../../modules/hrm/department/department.routes.ts";
import { AttendanceRoutes } from "../../modules/hrm/attendance/attendance.routes.ts";
import { LeaveRoutes } from "../../modules/hrm/leave/leave.routes.ts";
import { ShareholderRoutes } from "../../modules/governance/shareholder/shareholder.routes.ts";
import { VotingRoutes } from "../../modules/governance/voting/voting.routes.ts";
import { MeetingRoutes } from "../../modules/governance/meeting/meeting.routes.ts";
import { ComplianceRoutes } from "../../modules/governance/compliance/compliance.routes.ts";

import requireModule from "../../../core/middleware/license.middleware.ts";
import auth from "../../../core/middleware/auth.ts";
import contextGuard from "@app/middlewares/contextGuard.ts";
import queryContext from "@app/middlewares/queryContext.ts";
import { auditMiddleware } from "../../../core/middleware/audit.middleware.ts";
import contextMiddleware from "../../../core/middleware/context.middleware.ts";

const router = Router();

// ========================================================================
// 🔓 PUBLIC ROUTES
// ========================================================================
router.use("/auth", authGroupRoutes);
router.use("/public", publicGroupRoutes);

// ========================================================================
// 🛡️ GLOBAL OPERATIONAL SECURITY LAYER (Centralized)
// ========================================================================
// Initialize Context first, then Auth, then Audit.
router.use(contextMiddleware); // 🟢 1. Initialize AsyncLocalStorage Context
router.use(auth());            // 🔐 2. Populate Context with User & Scope
router.use(queryContext());    // 🔍 3. Legacy Query Injection
router.use(auditMiddleware);   // 🔴 4. Automatic Audit Logging

router.use("/super-admin", adminGroupRoutes);
router.use("/customer", customerGroupRoutes);
router.use("/user", userRoutes); // Profile, Settings, etc.
router.use("/platform/packages", PackageRoutes);
router.use("/platform/licenses", LicenseRoutes);
router.use("/platform/companies", CompanyRoutes);

// HRM Module - Licensed & Context Guarded
router.use("/hrm/departments", requireModule('hrm'), contextGuard(), DepartmentRoutes);
router.use("/hrm/attendance", requireModule('hrm'), contextGuard(), AttendanceRoutes);
router.use("/hrm/leave", requireModule('hrm'), contextGuard(), LeaveRoutes);

// Governance Module - Licensed & Context Guarded
router.use("/governance/shareholders", requireModule('governance'), contextGuard(), ShareholderRoutes);
router.use("/governance/voting", requireModule('governance'), contextGuard(), VotingRoutes);
router.use("/governance/meetings", requireModule('governance'), contextGuard(), MeetingRoutes);
router.use("/governance/compliance", requireModule('governance'), contextGuard(), ComplianceRoutes);

export const v1Routes = router;
