import { Router } from "express";
import { authRoutes } from "./auth.route";
import { clientRoutes } from "./client.route";
import { workoutRoutes } from "./workout.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/workouts", workoutRoutes);
router.use("/my-workouts", clientRoutes);

export { router as apiRoutes };
