import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

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
	res.status(500).json({ success: false, message: "Internal server error" });
};

export default errorHandler;
