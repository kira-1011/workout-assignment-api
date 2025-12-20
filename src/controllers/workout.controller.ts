import type { NextFunction, Request, Response } from "express";
import {
	assignWorkoutSchema,
	createWorkoutSchema,
} from "../schemas/workout.schema";
import {
	assignWorkout,
	createWorkout,
	getClientWorkouts,
	getTrainerWorkouts,
} from "../services/workout.service";
import type {
	AssignmentCreateResponse,
	ClientAssignmentsResponse,
	WorkoutCreateResponse,
	WorkoutListResponse,
} from "../types/api.type";

/**
 * GET /workouts - Get all workouts for the logged-in trainer
 * @returns {WorkoutListResponse}
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

		const response: WorkoutListResponse = {
			success: true,
			data: workouts,
		};
		res.status(200).json(response);
	} catch (error) {
		next(error);
	}
}

/**
 * GET /my-workouts - Get all assigned workouts for the logged-in client
 * @returns {ClientAssignmentsResponse}
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

		const response: ClientAssignmentsResponse = {
			success: true,
			data: assignments,
		};
		res.status(200).json(response);
	} catch (error) {
		next(error);
	}
}

/**
 * POST /workouts - Create a new workout
 * @returns {WorkoutCreateResponse}
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

		const response: WorkoutCreateResponse = {
			success: true,
			message: "Workout created successfully",
			data: workout,
		};
		res.status(201).json(response);
	} catch (error) {
		next(error);
	}
}

/**
 * POST /workouts/:id/assign - Assign a workout to a client
 * @returns {AssignmentCreateResponse}
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
		const payload = assignWorkoutSchema.parse(req.body);

		const assignment = await assignWorkout(trainerId, workoutId, payload);

		const response: AssignmentCreateResponse = {
			success: true,
			message: "Workout assigned successfully",
			data: assignment,
		};
		res.status(201).json(response);
	} catch (error) {
		next(error);
	}
}
