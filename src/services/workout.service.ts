import { prisma } from "../lib/prisma.js";

/**
 * Get all workouts created by a specific trainer
 */
export async function getTrainerWorkouts(trainerId: string) {
	const workouts = await prisma.workout.findMany({
		where: { trainerId },
		select: {
			id: true,
			name: true,
			description: true,
			createdAt: true,
			updatedAt: true,
			_count: {
				select: { assignments: true },
			},
		},
		orderBy: { createdAt: "desc" },
	});

	return workouts.map((workout) => ({
		id: workout.id,
		name: workout.name,
		description: workout.description,
		createdAt: workout.createdAt,
		updatedAt: workout.updatedAt,
		assignmentCount: workout._count.assignments,
	}));
}

/**
 * Get all workout assignments for a specific client
 */
export async function getClientWorkouts(clientId: string) {
	const assignments = await prisma.workoutAssignment.findMany({
		where: { clientId },
		select: {
			id: true,
			assignedDate: true,
			status: true,
			workout: {
				select: {
					id: true,
					name: true,
					description: true,
					trainer: {
						select: {
							id: true,
							email: true,
						},
					},
				},
			},
		},
		orderBy: { assignedDate: "desc" },
	});

	return assignments;
}

/**
 * Create a new workout
 */
export async function createWorkout(
	trainerId: string,
	data: { name: string; description?: string },
) {
	const workout = await prisma.workout.create({
		data: {
			name: data.name,
			description: data.description,
			trainerId,
		},
		select: {
			id: true,
			name: true,
			description: true,
			createdAt: true,
		},
	});

	return workout;
}

/**
 * Assign a workout to a client
 */
export async function assignWorkout(
	trainerId: string,
	workoutId: string,
	clientId: string,
) {
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
	const assignment = await prisma.workoutAssignment.create({
		data: {
			workoutId,
			clientId,
		},
		select: {
			id: true,
			assignedDate: true,
			status: true,
			workout: {
				select: {
					id: true,
					name: true,
				},
			},
			client: {
				select: {
					id: true,
					email: true,
				},
			},
		},
	});

	return assignment;
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
