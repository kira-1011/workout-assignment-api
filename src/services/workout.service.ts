import { prisma } from "../lib/prisma";
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
	data: { name: string; description?: string },
): Promise<WorkoutResponse> {
	return prisma.workout.create({
		data: {
			name: data.name,
			description: data.description,
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
	clientId: string,
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
		where: { id: clientId },
		select: { id: true, role: true, email: true },
	});

	if (!client) {
		throw new WorkoutError("Client not found", 404);
	}

	if (client.role !== "client") {
		throw new WorkoutError("User is not a client", 400);
	}

	// Create the assignment
	return prisma.workoutAssignment.create({
		data: {
			workoutId,
			clientId,
		},
		select: assignmentResponseSelect,
	});
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
