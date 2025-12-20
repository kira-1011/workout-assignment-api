import { describe, expect, it } from "vitest";
import { Prisma } from "../../../generated/prisma/client";
import { prismaMock } from "../../lib/__mocks__/prisma";
import {
	assignWorkout,
	createWorkout,
	getClientWorkouts,
	getTrainerWorkouts,
	WorkoutError,
} from "../workout.service";

describe("Workout Service", () => {
	// ==========================================
	// getTrainerWorkouts Tests
	// ==========================================
	describe("getTrainerWorkouts", () => {
		it("should return all workouts for a trainer", async () => {
			const trainerId = "trainer-123";
			const mockWorkouts = [
				{
					id: "workout-1",
					name: "Morning Cardio",
					description: "30 min run",
					createdAt: new Date(),
					updatedAt: new Date(),
					_count: { assignments: 2 },
				},
				{
					id: "workout-2",
					name: "Evening Weights",
					description: "Weight training session",
					createdAt: new Date(),
					updatedAt: new Date(),
					_count: { assignments: 0 },
				},
			];

			prismaMock.workout.findMany.mockResolvedValue(mockWorkouts as never);

			const result = await getTrainerWorkouts(trainerId);

			expect(prismaMock.workout.findMany).toHaveBeenCalledWith({
				where: { trainerId },
				select: expect.any(Object),
				orderBy: { createdAt: "desc" },
			});
			expect(result).toHaveLength(2);
			expect(result[0].name).toBe("Morning Cardio");
		});

		it("should return empty array if trainer has no workouts", async () => {
			prismaMock.workout.findMany.mockResolvedValue([]);

			const result = await getTrainerWorkouts("trainer-no-workouts");

			expect(result).toEqual([]);
		});
	});

	// ==========================================
	// getClientWorkouts Tests
	// ==========================================
	describe("getClientWorkouts", () => {
		it("should return all assigned workouts for a client", async () => {
			const clientId = "client-123";
			const mockAssignments = [
				{
					id: "assignment-1",
					assignedDate: new Date(),
					status: "assigned",
					workout: {
						id: "workout-1",
						name: "Morning Cardio",
						description: "30 min run",
						trainer: { id: "trainer-1", email: "trainer@test.com" },
					},
				},
			];

			prismaMock.workoutAssignment.findMany.mockResolvedValue(
				mockAssignments as never,
			);

			const result = await getClientWorkouts(clientId);

			expect(prismaMock.workoutAssignment.findMany).toHaveBeenCalledWith({
				where: { clientId },
				select: expect.any(Object),
				orderBy: { assignedDate: "desc" },
			});
			expect(result).toHaveLength(1);
			expect(result[0].workout.name).toBe("Morning Cardio");
		});

		it("should return empty array if client has no assignments", async () => {
			prismaMock.workoutAssignment.findMany.mockResolvedValue([]);

			const result = await getClientWorkouts("client-no-assignments");

			expect(result).toEqual([]);
		});
	});

	// ==========================================
	// createWorkout Tests
	// ==========================================
	describe("createWorkout", () => {
		it("should create a new workout", async () => {
			const trainerId = "trainer-123";
			const input = { name: "HIIT Session", description: "High intensity" };
			const mockCreated = {
				id: "new-workout-id",
				name: input.name,
				description: input.description,
				createdAt: new Date(),
			};

			prismaMock.workout.create.mockResolvedValue(mockCreated as never);

			const result = await createWorkout(trainerId, input);

			expect(prismaMock.workout.create).toHaveBeenCalledWith({
				data: {
					name: input.name,
					description: input.description,
					trainerId,
				},
				select: expect.any(Object),
			});
			expect(result.name).toBe(input.name);
			expect(result.id).toBeDefined();
		});
	});

	// ==========================================
	// assignWorkout Tests
	// ==========================================
	describe("assignWorkout", () => {
		const trainerId = "trainer-123";
		const workoutId = "workout-123";
		const clientId = "client-123";

		it("should assign a workout to a client successfully", async () => {
			prismaMock.workout.findUnique.mockResolvedValue({
				id: workoutId,
				trainerId,
			} as never);
			prismaMock.user.findUnique.mockResolvedValue({
				id: clientId,
				role: "client",
				email: "client@test.com",
			} as never);
			prismaMock.workoutAssignment.create.mockResolvedValue({
				id: "assignment-123",
				assignedDate: new Date(),
				status: "assigned",
				workout: { id: workoutId, name: "Test Workout" },
				client: { id: clientId, email: "client@test.com" },
			} as never);

			const result = await assignWorkout(trainerId, workoutId, { clientId });

			expect(result.id).toBe("assignment-123");
			expect(result.status).toBe("assigned");
		});

		it("should throw WorkoutError (404) if workout not found", async () => {
			prismaMock.workout.findUnique.mockResolvedValue(null);

			await expect(
				assignWorkout(trainerId, workoutId, { clientId }),
			).rejects.toThrow(WorkoutError);
			await expect(
				assignWorkout(trainerId, workoutId, { clientId }),
			).rejects.toThrow("Workout not found");
		});

		it("should throw WorkoutError (403) if trainer doesn't own workout", async () => {
			prismaMock.workout.findUnique.mockResolvedValue({
				id: workoutId,
				trainerId: "different-trainer",
			} as never);

			await expect(
				assignWorkout(trainerId, workoutId, { clientId }),
			).rejects.toThrow("You can only assign your own workouts");
		});

		it("should throw WorkoutError (404) if client not found", async () => {
			prismaMock.workout.findUnique.mockResolvedValue({
				id: workoutId,
				trainerId,
			} as never);
			prismaMock.user.findUnique.mockResolvedValue(null);

			await expect(
				assignWorkout(trainerId, workoutId, { clientId }),
			).rejects.toThrow("Client not found");
		});

		it("should throw WorkoutError (400) if user is not a client", async () => {
			prismaMock.workout.findUnique.mockResolvedValue({
				id: workoutId,
				trainerId,
			} as never);
			prismaMock.user.findUnique.mockResolvedValue({
				id: clientId,
				role: "trainer", // Wrong role!
				email: "trainer@test.com",
			} as never);

			await expect(
				assignWorkout(trainerId, workoutId, { clientId }),
			).rejects.toThrow("User is not a client");
		});

		it("should throw WorkoutError (409) if workout already assigned to client", async () => {
			prismaMock.workout.findUnique.mockResolvedValue({
				id: workoutId,
				trainerId,
			} as never);
			prismaMock.user.findUnique.mockResolvedValue({
				id: clientId,
				role: "client",
				email: "client@test.com",
			} as never);

			// Simulate unique constraint violation (P2002)
			const uniqueConstraintError = new Prisma.PrismaClientKnownRequestError(
				"Unique constraint failed",
				{ code: "P2002", clientVersion: "5.0.0" },
			);
			prismaMock.workoutAssignment.create.mockRejectedValue(
				uniqueConstraintError,
			);

			await expect(
				assignWorkout(trainerId, workoutId, { clientId }),
			).rejects.toThrow(WorkoutError);
			await expect(
				assignWorkout(trainerId, workoutId, { clientId }),
			).rejects.toThrow("Workout already assigned to this client");
		});
	});
});
