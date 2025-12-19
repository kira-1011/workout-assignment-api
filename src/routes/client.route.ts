import { Router } from "express";

const router = Router();

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
router.get("/", (_req, res) => {
	// TODO: Implement get my workouts
	res.status(501).json({ message: "Not implemented yet" });
});

export { router as clientRoutes };
