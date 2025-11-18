import { Router } from "express";
import profileRoutes from "./profile.routes.js";
// import ordersRoutes from "./orders.routes.js";
// import cartRoutes from "./cart.routes.js";
// import wishlistRoutes from "./wishlist.routes.js";
// import addressRoutes from "./address.routes.js";
// import paymentRoutes from "./payment.routes.js";
// import reviewsRoutes from "./reviews.routes.js";
// import trackingRoutes from "./tracking.routes.js";

const router = Router();

router.use("/profile", profileRoutes);
// router.use("/orders", ordersRoutes);
// router.use("/cart", cartRoutes);
// router.use("/wishlist", wishlistRoutes);
// router.use("/address", addressRoutes);
// router.use("/payment", paymentRoutes);
// router.use("/reviews", reviewsRoutes);
// router.use("/tracking", trackingRoutes);

export default router;