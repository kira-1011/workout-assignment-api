import type { Prisma } from "../../generated/prisma/client";

// Trainer's workout list (with assignment count)
export const workoutListSelect = {
	id: true,
	name: true,
	description: true,
	createdAt: true,
	updatedAt: true,
	_count: { select: { assignments: true } },
} satisfies Prisma.WorkoutSelect;

// Single workout (for create response)
export const workoutSelect = {
	id: true,
	name: true,
	description: true,
	createdAt: true,
} satisfies Prisma.WorkoutSelect;

// Client's assigned workouts
export const clientAssignmentSelect = {
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
} satisfies Prisma.WorkoutAssignmentSelect;

// Assignment response (after assigning)
export const assignmentResponseSelect = {
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
} satisfies Prisma.WorkoutAssignmentSelect;

// ============================================
// INFERRED TYPES (Auto-generated from selects!)
// ============================================

export type WorkoutListItem = Prisma.WorkoutGetPayload<{
	select: typeof workoutListSelect;
}>;
export type WorkoutResponse = Prisma.WorkoutGetPayload<{
	select: typeof workoutSelect;
}>;
export type ClientAssignment = Prisma.WorkoutAssignmentGetPayload<{
	select: typeof clientAssignmentSelect;
}>;
export type AssignmentResponse = Prisma.WorkoutAssignmentGetPayload<{
	select: typeof assignmentResponseSelect;
}>;

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
	success: boolean;
	message?: string;
	data?: T;
}

export interface ApiErrorResponse {
	success: false;
	message: string;
	errors?: { field: string; message: string }[];
}

// ============================================
// AUTH RESPONSE TYPES
// ============================================

export interface AuthUser {
	id: string;
	email: string;
	role: "trainer" | "client";
}

export interface AuthData {
	user: AuthUser;
	token: string;
}

export type AuthResponse = ApiResponse<AuthData>;

// ============================================
// WORKOUT RESPONSE TYPES
// ============================================

export type WorkoutListResponse = ApiResponse<WorkoutListItem[]>;
export type WorkoutCreateResponse = ApiResponse<WorkoutResponse>;
export type AssignmentCreateResponse = ApiResponse<AssignmentResponse>;
export type ClientAssignmentsResponse = ApiResponse<ClientAssignment[]>;
