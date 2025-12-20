import { Router } from "express";
import { authRoutes } from "./auth.route";
import { myWorkoutRoutes, workoutRoutes } from "./workout.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/workouts", workoutRoutes);
router.use("/my-workouts", myWorkoutRoutes);

export { router as apiRoutes };
