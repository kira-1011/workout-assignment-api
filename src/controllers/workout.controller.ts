import type { NextFunction, Request, Response } from "express";
import {
	assignWorkoutSchema,
	createWorkoutSchema,
} from "../schemas/workout.schema.js";
import {
	assignWorkout,
	createWorkout,
	getClientWorkouts,
	getTrainerWorkouts,
} from "../services/workout.service.js";

/**
 * GET /workouts - Get all workouts for the logged-in trainer
 */
export async function getWorkouts(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const trainerId = req.user?.userId;
		if (!trainerId) {
			res.status(401).json({ success: false, message: "Unauthorized" });
			return;
		}
		const workouts = await getTrainerWorkouts(trainerId);

		res.status(200).json({
			success: true,
			data: workouts,
		});
	} catch (error) {
		next(error);
	}
}

/**
 * GET /my-workouts - Get all assigned workouts for the logged-in client
 */
export async function getMyWorkouts(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const clientId = req.user?.userId;
		if (!clientId) {
			res.status(401).json({ success: false, message: "Unauthorized" });
			return;
		}
		const assignments = await getClientWorkouts(clientId);

		res.status(200).json({
			success: true,
			data: assignments,
		});
	} catch (error) {
		next(error);
	}
}

/**
 * POST /workouts - Create a new workout
 */
export async function createWorkoutHandler(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const trainerId = req.user?.userId;
		if (!trainerId) {
			res.status(401).json({ success: false, message: "Unauthorized" });
			return;
		}

		const data = createWorkoutSchema.parse(req.body);
		const workout = await createWorkout(trainerId, data);

		res.status(201).json({
			success: true,
			message: "Workout created successfully",
			data: workout,
		});
	} catch (error) {
		next(error);
	}
}

/**
 * POST /workouts/:id/assign - Assign a workout to a client
 */
export async function assignWorkoutHandler(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const trainerId = req.user?.userId;
		if (!trainerId) {
			res.status(401).json({ success: false, message: "Unauthorized" });
			return;
		}

		const workoutId = req.params.id;
		const { clientId } = assignWorkoutSchema.parse(req.body);

		const assignment = await assignWorkout(trainerId, workoutId, clientId);

		res.status(201).json({
			success: true,
			message: "Workout assigned successfully",
			data: assignment,
		});
	} catch (error) {
		next(error);
	}
}
