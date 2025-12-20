import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AuthError } from "../services/auth.service.js";
import { WorkoutError } from "../services/workout.service.js";

const errorHandler = (
	err: Error,
	_req: Request,
	res: Response,
	_next: NextFunction,
) => {
	console.error("Global error handler caught:", err);
	// Zod validation errors
	if (err instanceof ZodError) {
		res.status(400).json({
			success: false,
			message: "Validation error",
			errors: err.issues.map((e) => ({
				field: e.path.join("."),
				message: e.message,
			})),
		});
		return;
	}

	// Auth errors
	if (err instanceof AuthError) {
		res.status(err.statusCode).json({
			success: false,
			message: err.message,
		});
		return;
	}

	// Workout errors
	if (err instanceof WorkoutError) {
		res.status(err.statusCode).json({
			success: false,
			message: err.message,
		});
		return;
	}

	res.status(500).json({ success: false, message: "Internal server error" });
};

export default errorHandler;
