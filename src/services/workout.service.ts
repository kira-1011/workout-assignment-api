import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../lib/prisma";
import type {
	AssignWorkoutInput,
	CreateWorkoutInput,
} from "../schemas/workout.schema";
import {
	type AssignmentResponse,
	assignmentResponseSelect,
	type ClientAssignment,
	clientAssignmentSelect,
	type WorkoutListItem,
	type WorkoutResponse,
	workoutListSelect,
	workoutSelect,
} from "../types/api.type";

/**
 * Get all workouts created by a specific trainer
 */
export async function getTrainerWorkouts(
	trainerId: string,
): Promise<WorkoutListItem[]> {
	return prisma.workout.findMany({
		where: { trainerId },
		select: workoutListSelect,
		orderBy: { createdAt: "desc" },
	});
}

/**
 * Get all workout assignments for a specific client
 */
export async function getClientWorkouts(
	clientId: string,
): Promise<ClientAssignment[]> {
	return prisma.workoutAssignment.findMany({
		where: { clientId },
		select: clientAssignmentSelect,
		orderBy: { assignedDate: "desc" },
	});
}

/**
 * Create a new workout
 */
export async function createWorkout(
	trainerId: string,
	payload: CreateWorkoutInput,
): Promise<WorkoutResponse> {
	return prisma.workout.create({
		data: {
			name: payload.name,
			description: payload.description,
			trainerId,
		},
		select: workoutSelect,
	});
}

/**
 * Assign a workout to a client
 */
export async function assignWorkout(
	trainerId: string,
	workoutId: string,
	payload: AssignWorkoutInput,
): Promise<AssignmentResponse> {
	// Verify the workout exists and belongs to this trainer
	const workout = await prisma.workout.findUnique({
		where: { id: workoutId },
		select: { id: true, trainerId: true },
	});

	if (!workout) {
		throw new WorkoutError("Workout not found", 404);
	}

	if (workout.trainerId !== trainerId) {
		throw new WorkoutError("You can only assign your own workouts", 403);
	}

	// Verify the client exists and has the client role
	const client = await prisma.user.findUnique({
		where: { id: payload.clientId },
		select: { id: true, role: true, email: true },
	});

	if (!client) {
		throw new WorkoutError("Client not found", 404);
	}

	if (client.role !== "client") {
		throw new WorkoutError("User is not a client", 400);
	}

	// Create the assignment
	try {
		return await prisma.workoutAssignment.create({
			data: {
				workoutId,
				clientId: payload.clientId,
			},
			select: assignmentResponseSelect,
		});
	} catch (error) {
		// Handle unique constraint violation (duplicate assignment)
		if (
			error instanceof Prisma.PrismaClientKnownRequestError &&
			error.code === "P2002"
		) {
			throw new WorkoutError("Workout already assigned to this client", 409);
		}

		throw new WorkoutError("Failed to assign workout", 500);
	}
}

// Custom error class for workout errors
export class WorkoutError extends Error {
	constructor(
		message: string,
		public statusCode: number,
	) {
		super(message);
		this.name = "WorkoutError";
	}
}
