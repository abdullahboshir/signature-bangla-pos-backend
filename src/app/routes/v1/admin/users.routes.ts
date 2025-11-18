import { Router } from "express";
import { userRoutes } from "../../../modules/user/user.routes.js";
import { roleRoutes } from "../../../modules/role/role.routes.js";
import { permissionRoutes } from "../../../modules/permission/permission.routes.js";



const router = Router();

router.use("/", userRoutes);
router.use("/roles", roleRoutes);
router.use("/permissions", permissionRoutes);

export default router;