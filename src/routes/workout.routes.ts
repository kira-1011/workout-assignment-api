import { Router } from "express";
import {
	assignWorkoutHandler,
	createWorkoutHandler,
	getMyWorkouts,
	getWorkouts,
} from "../controllers/workout.controller.js";
import {
	authenticate,
	isClient,
	isTrainer,
} from "../middleware/auth.middleware.js";

const router = Router();
const myWorkoutsRouter = Router();

// ============================================
// TRAINER ROUTES (/workouts)
// ============================================

/**
 * @openapi
 * /workouts:
 *   post:
 *     tags:
 *       - Workouts
 *     summary: Create a new workout (trainer only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Workout created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - trainers only
 */
router.post("/", authenticate, isTrainer, createWorkoutHandler);

/**
 * @openapi
 * /workouts:
 *   get:
 *     tags:
 *       - Workouts
 *     summary: Get all workouts for logged-in trainer
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of workouts
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - trainers only
 */
router.get("/", authenticate, isTrainer, getWorkouts);

/**
 * @openapi
 * /workouts/{id}/assign:
 *   post:
 *     tags:
 *       - Workouts
 *     summary: Assign workout to a client (trainer only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workout ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clientId
 *             properties:
 *               clientId:
 *                 type: string
 *                 description: The client user ID to assign the workout to
 *     responses:
 *       201:
 *         description: Workout assigned successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - trainers only
 *       404:
 *         description: Workout or client not found
 */
router.post("/:id/assign", authenticate, isTrainer, assignWorkoutHandler);

// ============================================
// CLIENT ROUTES (/my-workouts)
// ============================================

/**
 * @openapi
 * /my-workouts:
 *   get:
 *     tags:
 *       - Client
 *     summary: Get assigned workouts (client only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of assigned workouts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   workoutId:
 *                     type: string
 *                   assignedDate:
 *                     type: string
 *                     format: date-time
 *                   status:
 *                     type: string
 *                     enum: [assigned, cancelled]
 *                   workout:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - clients only
 */
myWorkoutsRouter.get("/", authenticate, isClient, getMyWorkouts);

export { router as workoutRoutes, myWorkoutsRouter as myWorkoutRoutes };
