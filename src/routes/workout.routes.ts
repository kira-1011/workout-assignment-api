import { Router } from "express";

const router = Router();

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
router.post("/", (_req, res) => {
	// TODO: Implement create workout
	res.status(501).json({ message: "Not implemented yet" });
});

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
router.get("/", (_req, res) => {
	// TODO: Implement get all workouts
	res.status(501).json({ message: "Not implemented yet" });
});

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
router.post("/:id/assign", (_req, res) => {
	// TODO: Implement assign workout
	res.status(501).json({ message: "Not implemented yet" });
});

export { router as workoutRoutes };
