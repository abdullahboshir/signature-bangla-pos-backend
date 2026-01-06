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
router.use("/hrm/departments", DepartmentRoutes);
router.use("/hrm/attendance", AttendanceRoutes);
router.use("/hrm/leave", LeaveRoutes);
router.use("/governance/shareholders", ShareholderRoutes);
router.use("/governance/voting", VotingRoutes);
router.use("/governance/meetings", MeetingRoutes);
router.use("/governance/compliance", ComplianceRoutes);

export const v1Routes = router;
