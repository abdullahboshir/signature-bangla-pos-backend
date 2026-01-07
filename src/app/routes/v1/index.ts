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

const router = Router();

router.use("/super-admin", adminGroupRoutes);
// router.use("/business-admin", businessAdminRoutes);
router.use("/customer", customerGroupRoutes);
router.use("/public", publicGroupRoutes);
// router.use("/webhook", webhookRoutes);
router.use("/auth", authGroupRoutes);
router.use("/user", userRoutes); // Registered User Routes (Profile, Settings, etc.)
router.use("/platform/packages", PackageRoutes);
router.use("/platform/licenses", LicenseRoutes);
router.use("/platform/companies", CompanyRoutes);

// HRM Module - Licensed
router.use("/hrm/departments", requireModule('hrm'), DepartmentRoutes);
router.use("/hrm/attendance", requireModule('hrm'), AttendanceRoutes);
router.use("/hrm/leave", requireModule('hrm'), LeaveRoutes);

// Governance Module - Licensed
router.use("/governance/shareholders", requireModule('governance'), ShareholderRoutes);
router.use("/governance/voting", requireModule('governance'), VotingRoutes);
router.use("/governance/meetings", requireModule('governance'), MeetingRoutes);
router.use("/governance/compliance", requireModule('governance'), ComplianceRoutes);

export const v1Routes = router;
